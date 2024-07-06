//api/user-reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { getUserReservations } from '@/actions';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    }

    try {
        const reservations = await getUserReservations(userId);
        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        return NextResponse.json({
            error: 'Erreur lors de la récupération des réservations de l\'utilisateur'
        }, { status: 500 });
    }
}