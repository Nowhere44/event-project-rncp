//api/payment/[reservationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';
import { ReservationStatus, PaymentStatus } from "@prisma/client";
import { updateUserTotalRevenue } from '@/actions/user';

export async function POST(req: NextRequest, { params }: { params: { reservationId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: params.reservationId },
            include: { event: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
        }

        if (reservation.status === ReservationStatus.Confirmed) {
            return NextResponse.json({ error: 'Cette réservation a déjà été payée' }, { status: 400 });
        }

        // Simuler le paiement (à remplacer par votre logique de paiement réelle)
        const paymentSuccessful = true;

        if (paymentSuccessful) {
            // Mettre à jour le statut de la réservation
            const updatedReservation = await prisma.reservation.update({
                where: { id: params.reservationId },
                data: { status: ReservationStatus.Confirmed },
            });

            // Créer un enregistrement de paiement
            await prisma.payment.create({
                data: {
                    reservationId: params.reservationId,
                    amount: reservation.totalAmount,
                    paymentDate: new Date(),
                    paymentMethod: 'Stripe', // ou toute autre méthode que vous utilisez
                    status: PaymentStatus.Paid
                }
            });

            // Mettre à jour le revenu total de l'organisateur
            await updateUserTotalRevenue(reservation.event.userId);

            return NextResponse.json({ success: true, reservation: updatedReservation });
        } else {
            return NextResponse.json({ error: 'Le paiement a échoué' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json({ error: 'Une erreur est survenue lors du traitement du paiement' }, { status: 500 });
    }
}