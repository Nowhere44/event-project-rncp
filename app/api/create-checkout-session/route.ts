//api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth.config';
import { prisma } from '@/server/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reservationId } = await req.json();
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { event: true },
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
        }

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `${reservation.event.title} - ${reservation.numberOfTickets} ticket(s)`,
                    },
                    unit_amount: Math.round(Number(reservation.totalAmount) * 100), // Stripe utilise les centimes
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservations/${reservationId}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservations/${reservationId}?canceled=true`,
            metadata: {
                reservationId: reservationId,
            },
        });

        return NextResponse.json({ id: stripeSession.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
    }
}