import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: params.id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        start_time: true,
                    }
                },
                user: true
            }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
        }

        if (reservation.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        return NextResponse.json(reservation);
    } catch (error) {
        console.error('Error fetching reservation:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération de la réservation' }, { status: 500 });
    }
}