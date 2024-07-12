import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createReservation } from '@/actions/reservations/create';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { eventId, numberOfTickets, promoCode } = await req.json();
        const result = await createReservation({
            eventId,
            userId: session.user.id,
            numberOfTickets,
            promoCode
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error creating reservation or Stripe session:', error);
        return NextResponse.json({
            error: error.message || 'Une erreur est survenue lors de la création de la réservation ou de la session de paiement',
        }, { status: 500 });
    }
}