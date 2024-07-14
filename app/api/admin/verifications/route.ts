import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const verificationRequests = await prisma.verificationRequest.findMany({
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });

        return NextResponse.json(verificationRequests);
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes de vérification:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}