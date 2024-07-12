import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createReservation } from '@/actions';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { eventId, numberOfTickets } = await req.json();
        const result = await createReservation({
            eventId,
            userId: session.user.id,
            numberOfTickets
        });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json({
            error: 'Erreur lors de la création de la réservation',
        }, { status: 500 });
    }
}
