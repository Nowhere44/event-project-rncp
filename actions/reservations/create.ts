import { prisma } from '@/server/db';
import { Prisma, ReservationStatus, Event } from '@prisma/client';
import { updateUserTotalRevenue } from '@/actions/users/update';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

interface CreateReservationParams {
    eventId: string;
    userId: string;
    numberOfTickets: number;
    promoCode?: string;
}

export async function createReservation({ eventId, userId, numberOfTickets, promoCode }: CreateReservationParams) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { reservations: true }
    });

    if (!event) {
        throw new Error('Événement non trouvé');
    }

    validateEventDate(event);

    const now = new Date();
    const eventStartTime = new Date(event.start_time);
    const eventEndTime = new Date(event.end_time);

    if (now > eventEndTime) {
        throw new Error('Cet événement est déjà terminé');
    }


    if (event.isOnline) {
        const existingReservation = await prisma.reservation.findFirst({
            where: {
                eventId: event.id,
                userId: userId,
                status: ReservationStatus.Confirmed
            }
        });

        if (existingReservation) {
            throw new Error('Vous avez déjà réservé cet événement en ligne. Une seule réservation est autorisée par personne pour les événements en ligne.');
        }

        if (numberOfTickets > 1) {
            throw new Error('Pour les événements en ligne, vous ne pouvez réserver qu\'un seul ticket.');
        }
    } else {
        validateAvailableTickets(event, numberOfTickets);
    }

    const { discount, appliedPromoCode } = await applyPromoCode(event, promoCode);
    const totalAmount = calculateTotalAmount(event, numberOfTickets, discount);

    if (event.is_paid) {
        return await createPaidReservation(event, userId, numberOfTickets, totalAmount, appliedPromoCode);
    } else {
        return await createFreeReservation(event, userId, numberOfTickets, totalAmount, appliedPromoCode);
    }
}

function validateEventDate(event: Event) {
    const currentDate = new Date();
    const eventEndDate = new Date(event.end_time);

    if (eventEndDate.getTime() < currentDate.getTime()) {
        throw new Error('Cet événement est déjà terminé');
    }
}

function validateAvailableTickets(event: Event & { reservations: any[] }, numberOfTickets: number) {
    const reservedTickets = event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0);
    if (event.capacity - reservedTickets < numberOfTickets) {
        throw new Error('Il n\'y a pas assez de places disponibles');
    }
}

async function applyPromoCode(event: Event, promoCode?: string) {
    let discount = 0;
    let appliedPromoCode = null;

    if (promoCode && event.is_paid) {
        const validPromoCode = await prisma.promoCode.findFirst({
            where: {
                eventId: event.id,
                code: promoCode,
                used: false,
            },
        });
        if (validPromoCode) {
            discount = validPromoCode.discount;
            appliedPromoCode = promoCode;
        }
    }

    return { discount, appliedPromoCode };
}

function calculateTotalAmount(event: Event, numberOfTickets: number, discount: number) {
    return event.is_paid
        ? Number(event.price) * numberOfTickets * (1 - discount / 100)
        : 0;
}

async function createPaidReservation(event: Event, userId: string, numberOfTickets: number, totalAmount: number, appliedPromoCode: string | null) {
    const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'eur',
                product_data: {
                    name: `${event.title} - ${numberOfTickets} ticket(s)`,
                },
                unit_amount: Math.round(totalAmount * 100 / numberOfTickets),
            },
            quantity: numberOfTickets,
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
        metadata: {
            eventId: event.id,
            numberOfTickets: numberOfTickets.toString(),
            userId,
            appliedPromoCode: appliedPromoCode || '',
            totalAmount: totalAmount.toFixed(2),
        },
    });

    return { sessionId: stripeSession.id };
}

async function createFreeReservation(event: Event, userId: string, numberOfTickets: number, totalAmount: number, appliedPromoCode: string | null) {
    const reservation = await prisma.reservation.create({
        data: {
            eventId: event.id,
            userId,
            numberOfTickets,
            totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
            status: ReservationStatus.Confirmed,
            appliedPromoCode,
        },
        include: { event: true, user: true }
    });

    await updateUserTotalRevenue(event.userId);

    return {
        ...reservation,
        redirectUrl: `/reservations/${reservation.id}`,
    };
}
