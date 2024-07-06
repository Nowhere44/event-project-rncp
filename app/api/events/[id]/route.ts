//app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { validatePromoCode } from '@/actions';
import { updateEvent } from '@/actions/events/update';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { promoCode } = await req.json();
        const result = await validatePromoCode(params.id, promoCode);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error validating promo code:', error);
        return NextResponse.json({ error: 'Erreur lors de la validation du code promo sa valeur ne peut pas être superieure à 100%' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const eventData = await req.json();
        const updatedEvent = await updateEvent(params.id, eventData, session.user.id);
        return NextResponse.json(updatedEvent, { status: 200 });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'événement' }, { status: 500 });
    }
}