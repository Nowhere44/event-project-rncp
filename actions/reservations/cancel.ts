//actions/reservations/update.ts
import { prisma } from '@/server/db';
import { Prisma, Reservation, ReservationStatus } from '@prisma/client';
import { updateUserTotalRevenue } from '@/actions/users/update';
import { sendReservationCancellation } from '@/lib/email';

export async function cancelReservation(reservationId: string, ticketsToCancel: number, userId: string): Promise<{ message: string, reservation?: Reservation | null, redirect?: string }> {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { event: true, payment: true, user: true }
    });

    if (!reservation) {
        throw new Error('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
        throw new Error('Non autorisé');
    }

    const now = new Date();
    const eventDate = new Date(reservation.event.event_date);
    const timeDifference = eventDate.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    if (hoursDifference < 24) {
        throw new Error('Les annulations ne sont plus possibles 24 heures avant le début de l\'événement');
    }

    if (ticketsToCancel > reservation.numberOfTickets) {
        throw new Error('Nombre de tickets à annuler invalide');
    }

    const updatedReservation = await prisma.$transaction(async (prisma) => {
        const newNumberOfTickets = reservation.numberOfTickets - ticketsToCancel;
        const newTotalAmount = new Prisma.Decimal((parseFloat(reservation.totalAmount.toString()) * newNumberOfTickets / reservation.numberOfTickets).toFixed(2));

        if (newNumberOfTickets === 0) {
            await prisma.payment.deleteMany({
                where: { reservationId: reservationId }
            });
            await prisma.reservation.delete({ where: { id: reservationId } });
            return null;
        } else {
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

    await updateUserTotalRevenue(reservation.event.userId);

    if (!updatedReservation) {
        await sendReservationCancellation(
            reservation.user.email,
            reservation.event.title,
            reservation.numberOfTickets
        );
        return { message: 'Réservation annulée avec succès', redirect: `/profile` };
    } else {
        await sendReservationCancellation(
            updatedReservation.user.email,
            updatedReservation.event.title,
            ticketsToCancel
        );
        return { message: 'Réservation mise à jour avec succès', reservation: updatedReservation };
    }
}