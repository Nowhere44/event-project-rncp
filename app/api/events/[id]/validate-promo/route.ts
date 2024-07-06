// app/api/events/[id]/validate-promo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from "@/auth.config";
import { getServerSession } from 'next-auth/next';
import { validatePromoCode } from '@/actions/promoCodes/validate';


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
        return NextResponse.json({ error: 'Erreur lors de la validation du code promo sa valeur ne peut pas être superieure à 100%' }, { status: 400 });
    }
}