// actions/payment.ts
'use server'
import { prisma } from "@/server/db";
import { ReservationStatus, PaymentStatus } from "@prisma/client";
import { updateUserTotalRevenue } from "./user";
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { sendReservationConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

export async function verifyPayment(sessionId: string) {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            const reservation = await prisma.reservation.findUnique({
                where: { stripeSessionId: sessionId },
                include: {
                    event: true,
                    user: true
                }
            });

            if (!reservation) {
                console.error('Réservation non trouvée pour la session:', sessionId);
                return { success: false };
            }

            const totalAmount = new Prisma.Decimal(session.metadata?.totalAmount || (session.amount_total! / 100).toFixed(2));

            const updatedReservation = await prisma.reservation.update({
                where: { id: reservation.id },
                data: {
                    status: ReservationStatus.Confirmed,
                    totalAmount: totalAmount,
                },
                include: {
                    event: true,
                    user: true
                }
            });

            if (updatedReservation.appliedPromoCode) {
                await prisma.promoCode.update({
                    where: {
                        code: updatedReservation.appliedPromoCode,
                        eventId: updatedReservation.eventId
                    },
                    data: {
                        used: true,
                        usedById: updatedReservation.userId,
                        usedAt: new Date()
                    }
                });
            }

            if (updatedReservation) {
                await sendReservationConfirmation(
                    updatedReservation.user.email,
                    updatedReservation.event.title,
                    updatedReservation.numberOfTickets,
                    Number(updatedReservation.totalAmount)
                );
            }

            // Vérifier si un paiement existe déjà pour cette réservation
            const existingPayment = await prisma.payment.findUnique({
                where: { reservationId: updatedReservation.id }
            });

            if (!existingPayment) {
                // Créer un nouveau paiement seulement s'il n'existe pas déjà
                await prisma.payment.create({
                    data: {
                        reservationId: updatedReservation.id,
                        amount: new Prisma.Decimal((session.amount_total! / 100).toFixed(2)),
                        paymentDate: new Date(),
                        paymentMethod: 'Stripe',
                        status: PaymentStatus.Paid
                    }
                });
            }

            if (updatedReservation.event) {
                await updateUserTotalRevenue(updatedReservation.event.userId);
            }

            return {
                success: true,
                eventDetails: {
                    eventId: updatedReservation.eventId,
                    title: updatedReservation.event.title,
                    numberOfTickets: updatedReservation.numberOfTickets,
                    totalAmount: totalAmount,
                    eventDate: updatedReservation.event.event_date,
                    appliedPromoCode: session.metadata?.appliedPromoCode,
                    discount: session.metadata?.discount
                }
            };
        }
        return { success: false };
    } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        return { success: false };
    }
}