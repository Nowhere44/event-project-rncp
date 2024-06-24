import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';
import { sendReservationConfirmationEmail } from '@/lib/email';
import { ReservationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { eventId, numberOfTickets } = await req.json();

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { user: true }
        });

        if (!event) {
            return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
        }

        if (event.userId === session.user.id) {
            return NextResponse.json({ error: 'Vous ne pouvez pas réserver votre propre événement' }, { status: 400 });
        }

        if (event.capacity < numberOfTickets) {
            return NextResponse.json({ error: 'Pas assez de places disponibles' }, { status: 400 });
        }

        const totalAmount = event.is_paid ? Number(event.price) * numberOfTickets : 0;

        const reservation = await prisma.reservation.create({
            data: {
                eventId,
                userId: session.user.id,
                numberOfTickets,
                totalAmount,
                status: event.is_paid ? ReservationStatus.Pending : ReservationStatus.Confirmed,
            },
            include: { event: true, user: true }
        });

        // Mettre à jour la capacité de l'événement pour tous les événements
        await prisma.event.update({
            where: { id: eventId },
            data: { capacity: event.capacity - numberOfTickets }
        });

        if (!event.is_paid) {
            // Envoyer l'e-mail de confirmation pour les événements gratuits
            await sendReservationConfirmationEmail(reservation);
        }

        return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json({
            error: 'Erreur lors de la création de la réservation',
        }, { status: 500 });
    }
}

// Dans /api/reservations.ts
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    }

    try {
        const userEvents = await prisma.event.findMany({
            where: { userId },
            include: {
                reservations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(userEvents);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des réservations' }, { status: 500 });
    }
}