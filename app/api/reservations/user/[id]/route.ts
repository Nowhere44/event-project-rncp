// api/reservations/user/[id]/route.ts
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
        const reservations = await prisma.reservation.findMany({
            where: {
                userId: session.user.id,
                eventId: params.id,
                status: {
                    in: ['Confirmed', 'Pending']
                }
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        start_time: true,
                    }
                },
            }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des réservations' }, { status: 500 });
    }
}