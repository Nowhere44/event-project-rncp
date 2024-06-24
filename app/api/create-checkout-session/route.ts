import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string, {
    apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { reservationId } = await req.json();

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { event: true, user: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
        }

        if (reservation.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        if (!reservation.event.is_paid) {
            return NextResponse.json({ error: 'Cet événement est gratuit' }, { status: 400 });
        }

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: reservation.event.title,
                        },
                        unit_amount: Math.round(Number(reservation.totalAmount) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/reservation/${reservationId}/success`,
            cancel_url: `${req.headers.get('origin')}/reservation/${reservationId}/cancel`,
        });

        return NextResponse.json({ id: stripeSession.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'Erreur lors de la création de la session de paiement' }, { status: 500 });
    }
}