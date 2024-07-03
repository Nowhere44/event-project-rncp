import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';
import { ReservationStatus } from "@prisma/client";
import { Prisma } from '@prisma/client';
import { updateUserTotalRevenue } from '@/actions/user';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { eventId, numberOfTickets, promoCode } = await req.json();
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { reservations: true }
        });

        if (!event) {
            return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
        }

        const currentDate = new Date();
        const eventDate = new Date(event.event_date);

        if (eventDate.getTime() < currentDate.getTime()) {
            return NextResponse.json({ error: 'Cet événement est déjà passé' }, { status: 400 });
        }

        const reservedTickets = event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0);
        if (event.capacity - reservedTickets < numberOfTickets) {
            return NextResponse.json({ error: 'Il n\'y a pas assez de places disponibles' }, { status: 400 });
        }

        let discount = 0;
        let appliedPromoCode = null;
        if (promoCode && event.is_paid) {
            const validPromoCode = await prisma.promoCode.findFirst({
                where: {
                    eventId: eventId,
                    code: promoCode,
                    used: false,
                },
            });
            if (validPromoCode) {
                discount = validPromoCode.discount;
                appliedPromoCode = promoCode;
            }
        }

        const totalAmount = event.is_paid
            ? Number(event.price) * numberOfTickets * (1 - discount / 100)
            : 0;

        if (event.is_paid) {
            const unitPrice = Math.round((Number(event.price) * (1 - discount / 100)) * 100); // Prix unitaire en centimes
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
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
                metadata: {
                    eventId,
                    numberOfTickets: numberOfTickets.toString(),
                    userId: session.user.id,
                    appliedPromoCode: appliedPromoCode || '',
                    totalAmount: totalAmount.toFixed(2),
                    discount: discount.toString(),
                },
            });

            await prisma.reservation.create({
                data: {
                    eventId,
                    userId: session.user.id,
                    numberOfTickets,
                    totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
                    status: ReservationStatus.Pending,
                    appliedPromoCode,
                    stripeSessionId: stripeSession.id,
                },
            });
            return NextResponse.json({ sessionId: stripeSession.id });
        } else {
            const reservation = await prisma.reservation.create({
                data: {
                    eventId,
                    userId: session.user.id,
                    numberOfTickets,
                    totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
                    status: ReservationStatus.Confirmed,
                    appliedPromoCode,
                },
                include: { event: true, user: true }
            });

            await updateUserTotalRevenue(event.userId);

            return NextResponse.json({
                ...reservation,
                redirectUrl: `/reservations/${reservation.id}`,
            }, { status: 201 });
        }
    } catch (error) {
        console.error('Error creating reservation or Stripe session:', error);
        return NextResponse.json({
            error: 'Une erreur est survenue lors de la création de la réservation ou de la session de paiement',
        }, { status: 500 });
    }
}