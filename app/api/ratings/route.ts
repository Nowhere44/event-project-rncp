//api/ratings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';
import { sendReservationConfirmationEmail } from '@/lib/email';
import { ReservationStatus } from "@prisma/client";
import { Prisma } from '@prisma/client';
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';

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

        const availableCapacity = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                capacity: true,
                reservations: {
                    where: { status: ReservationStatus.Confirmed },
                    select: { numberOfTickets: true }
                }
            }
        });

        const totalReservedTickets = availableCapacity?.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0) || 0;
        const remainingCapacity = (availableCapacity?.capacity || 0) - totalReservedTickets;

        if (remainingCapacity < numberOfTickets) {
            return NextResponse.json({ error: 'Pas assez de places disponibles' }, { status: 400 });
        }

        const totalAmount = event.is_paid ? Number(event.price) * numberOfTickets : 0;

        const existingReservation = await prisma.reservation.findFirst({
            where: {
                userId: session.user.id,
                eventId,
                status: ReservationStatus.Confirmed,
            },
        });

        let reservation;
        if (existingReservation) {
            const currentTotal = parseFloat(existingReservation.totalAmount.toString());
            const newTotal = currentTotal + totalAmount;
            reservation = await prisma.reservation.update({
                where: { id: existingReservation.id },
                data: {
                    numberOfTickets: existingReservation.numberOfTickets + numberOfTickets,
                    totalAmount: new Prisma.Decimal(newTotal.toFixed(2)),
                },
                include: { event: true, user: true },
            });
        } else {
            reservation = await prisma.reservation.create({
                data: {
                    eventId,
                    userId: session.user.id,
                    numberOfTickets,
                    totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
                    status: event.is_paid ? ReservationStatus.Pending : ReservationStatus.Confirmed,
                },
                include: { event: true, user: true },
            });
        }

        if (!event.is_paid) {
            await sendReservationConfirmationEmail(reservation);
        }

        // Récupérer l'évaluation existante de l'utilisateur pour cet événement
        await connectToDatabase();
        const existingRating = await Rating.findOne({ userId: session.user.id, eventId });

        const redirectUrl = event.is_paid ? `/payment/${reservation.id}` : `/reservations/${reservation.id}`;

        return NextResponse.json({
            ...reservation,
            redirectUrl,
            existingRating
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json({
            error: 'Erreur lors de la création de la réservation',
        }, { status: 500 });
    }
}