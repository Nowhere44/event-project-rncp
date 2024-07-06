//app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { getReservationById, getReservationsByEventId } from '@/actions/reservations/read';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const reservation = await getReservationById(params.id);
        if (reservation) {
            return NextResponse.json(reservation);
        }

        const reservations = await getReservationsByEventId(params.id, session.user.id);
        if (reservations.length === 0) {
            return NextResponse.json({ error: 'Aucune réservation trouvée' }, { status: 404 });
        }

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des réservations' }, { status: 500 });
    }
}
