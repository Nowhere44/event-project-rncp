import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { cancelReservation } from '@/actions/reservations/cancel';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { ticketsToCancel } = await req.json();
        const result = await cancelReservation(params.id, ticketsToCancel, session.user.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return NextResponse.json({
            error: 'Erreur lors de l\'annulation de la réservation'
        }, { status: 500 });
    }
}
