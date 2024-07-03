//api/events/[id]/validate-promo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { authOptions } from "@/auth.config";
import { getServerSession } from 'next-auth/next';


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { promoCode } = await req.json();
        const validPromoCode = await prisma.promoCode.findFirst({
            where: {
                eventId: params.id,
                code: promoCode,
                used: false,
            },
        });

        if (validPromoCode) {
            // Marquer le code comme utilisé
            await prisma.promoCode.update({
                where: { id: validPromoCode.id },
                data: {
                    used: true,
                    usedById: session.user.id,
                    usedAt: new Date(),
                },
            });

            return NextResponse.json({ discount: validPromoCode.discount });
        } else {
            return NextResponse.json({ error: 'Code promo invalide ou déjà utilisé' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error validating promo code:', error);
        return NextResponse.json({ error: 'Erreur lors de la validation du code promo' }, { status: 500 });
    }
}