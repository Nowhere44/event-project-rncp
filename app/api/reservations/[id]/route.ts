// api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    console.log('Fetching reservations for id:', params.id);
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        console.log('Unauthorized: No session or user');
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        console.log('Attempting to find reservations');
        // Essayez d'abord de trouver une réservation spécifique
        const reservation = await prisma.reservation.findUnique({
            where: { id: params.id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        start_time: true,
                        end_time: true,
                        event_date: true,
                    }
                },
            }
        });

        if (reservation) {
            console.log('Reservation found:', reservation);
            return NextResponse.json(reservation);
        }

        // Si aucune réservation n'est trouvée, cherchez toutes les réservations pour cet événement
        const reservations = await prisma.reservation.findMany({
            where: {
                eventId: params.id,
                userId: session.user.id,
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
                        end_time: true,
                        event_date: true,
                    }
                },
            }
        });

        console.log('Reservations found:', reservations);

        if (reservations.length === 0) {
            console.log('No reservations found');
            return NextResponse.json({ error: 'Aucune réservation trouvée' }, { status: 404 });
        }

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des réservations' }, { status: 500 });
    }
}