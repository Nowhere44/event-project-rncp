import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                isVerified: true,
                verificationRequest: {
                    where: {
                        status: 'PENDING',
                        isArchived: false,
                    },
                    select: { id: true }
                }
            }
        });

        const response = {
            isVerified: user?.isVerified,
            hasPendingRequest: user?.verificationRequest !== null
        };

        console.log('Verification status response:', response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}