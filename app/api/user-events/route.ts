//api/user-events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { getUserEvents } from '@/actions';

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
        const events = await getUserEvents(userId);
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching user events:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des événements de l\'utilisateur' }, { status: 500 });
    }
}