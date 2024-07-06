//api/reservations/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { getUserReservationsForEvent } from '@/actions/reservations/read';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const reservations = await getUserReservationsForEvent(session.user.id, params.id);
        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des réservations' }, { status: 500 });
    }
}
