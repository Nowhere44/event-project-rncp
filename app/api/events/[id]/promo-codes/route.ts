// app/api/events/[id]/promo-codes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createPromoCodes, listPromoCodes } from '@/actions';
import { prisma } from '@/server/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { quantity, discount } = await req.json();
        const event = await prisma.event.findUnique({
            where: { id: params.id },
            include: { user: true }
        });

        if (!event) {
            return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
        }

        if (event.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        if (!event.is_paid) {
            return NextResponse.json({ error: 'Les codes promo ne sont disponibles que pour les événements payants' }, { status: 400 });
        }

        const promoCodes = await createPromoCodes(params.id, quantity, discount);

        return NextResponse.json({ message: 'Codes promo générés avec succès', promoCodes });
    } catch (error) {
        console.error('Error generating promo codes:', error);
        return NextResponse.json({ error: 'Erreur lors de la génération des codes promo' }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const event = await prisma.event.findUnique({
            where: { id: params.id },
            include: { user: true }
        });

        if (!event) {
            return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
        }

        if (event.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const promoCodes = await listPromoCodes(params.id);
        return NextResponse.json(promoCodes);
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des codes promo' }, { status: 500 });
    }
}