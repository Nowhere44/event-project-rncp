import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/server/db';
import { updateUserTotalRevenue } from '@/actions/user';
import { ReservationStatus, PaymentStatus, Prisma } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
    console.log("Webhook Stripe reçu");
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        console.log("Événement Stripe construit :", event.type);
    } catch (err: any) {
        console.error("Erreur lors de la construction de l'événement Stripe :", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { eventId, numberOfTickets, userId, appliedPromoCode } = session.metadata || {};

        if (eventId && numberOfTickets && userId) {
            try {
                const reservation = await prisma.reservation.create({
                    data: {
                        eventId,
                        userId,
                        numberOfTickets: parseInt(numberOfTickets),
                        totalAmount: new Prisma.Decimal(session.amount_total! / 100),
                        status: ReservationStatus.Confirmed,
                        appliedPromoCode: appliedPromoCode || undefined,
                    },
                    include: { event: true }
                });

                await prisma.payment.create({
                    data: {
                        reservationId: reservation.id,
                        amount: new Prisma.Decimal(session.amount_total! / 100),
                        paymentDate: new Date(),
                        paymentMethod: 'Stripe',
                        status: PaymentStatus.Paid
                    }
                });

                if (reservation.event) {
                    await updateUserTotalRevenue(reservation.event.userId);
                }
            } catch (error) {
                console.error('Erreur lors du traitement du paiement réussi:', error);
                return NextResponse.json({ error: 'Erreur lors du traitement du paiement' }, { status: 500 });
            }
        } else {
            console.error("Métadonnées manquantes dans la session Stripe");
        }
    } else {
        console.log(`Événement ignoré : ${event.type}`);
    }

    console.log("Fin du traitement du webhook");
    return NextResponse.json({ received: true });
}