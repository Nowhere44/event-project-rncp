// api/reservations/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';
import { Prisma, ReservationStatus } from '@prisma/client';
import { updateUserTotalRevenue } from '@/actions/user';
import { sendReservationCancellation } from '@/lib/email';


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const reservationId = params.id;
        const { ticketsToCancel } = await req.json();

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { event: true, payment: true, user: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
        }

        if (reservation.userId !== session.user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Vérifier si l'événement est dans moins de 24 heures
        const now = new Date();
        const eventDate = new Date(reservation.event.event_date);
        const timeDifference = eventDate.getTime() - now.getTime();
        const hoursDifference = timeDifference / (1000 * 3600);

        if (hoursDifference < 24) {
            return NextResponse.json({
                error: 'Les annulations ne sont plus possibles 24 heures avant le début de l\'événement'
            }, { status: 400 });
        }

        if (ticketsToCancel > reservation.numberOfTickets) {
            return NextResponse.json({ error: 'Nombre de tickets à annuler invalide' }, { status: 400 });
        }

        const updatedReservation = await prisma.$transaction(async (prisma) => {
            const newNumberOfTickets = reservation.numberOfTickets - ticketsToCancel;
            const newTotalAmount = new Prisma.Decimal((parseFloat(reservation.totalAmount.toString()) * newNumberOfTickets / reservation.numberOfTickets).toFixed(2));

            if (newNumberOfTickets === 0) {
                // Supprimer d'abord les paiements associés
                await prisma.payment.deleteMany({
                    where: { reservationId: reservationId }
                });

                // Si tous les tickets sont annulés, supprimer la réservation
                await prisma.reservation.delete({ where: { id: reservationId } });
                return null;
            } else {
                // Mettre à jour la réservation
                return await prisma.reservation.update({
                    where: { id: reservationId },
                    data: {
                        numberOfTickets: newNumberOfTickets,
                        totalAmount: newTotalAmount,
                    },
                    include: {
                        event: true,
                        user: true
                    }
                });
            }
        });

        // Mise à jour du revenu total de l'organisateur
        await updateUserTotalRevenue(reservation.event.userId);

        if (!updatedReservation) {
            await sendReservationCancellation(
                reservation.user.email,
                reservation.event.title,
                reservation.numberOfTickets
            );
            // Si la réservation a été supprimée, rediriger vers la page de profil
            return NextResponse.json({ message: 'Réservation annulée avec succès', redirect: `/profile` });
        } else {
            await sendReservationCancellation(
                updatedReservation.user.email,
                updatedReservation.event.title,
                ticketsToCancel
            );
            return NextResponse.json({ message: 'Réservation mise à jour avec succès', reservation: updatedReservation });
        }
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return NextResponse.json({
            error: 'Erreur lors de l\'annulation de la réservation'
        }, { status: 500 });
    }
}