// actions/payment.ts
'use server'
import { prisma } from "@/server/db";
import { ReservationStatus, PaymentStatus } from "@prisma/client";
import { updateUserTotalRevenue } from "@/actions/users/update";
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
            // Vérifier si une réservation existe déjà avec ce stripeSessionId
            let reservation = await prisma.reservation.findUnique({
                where: { stripeSessionId: sessionId },
                include: {
                    event: true,
                    user: true
                }
            });

            if (!reservation) {
                // Si la réservation n'existe pas, la créer
                reservation = await prisma.reservation.create({
                    data: {
                        eventId: session.metadata!.eventId,
                        userId: session.metadata!.userId,
                        numberOfTickets: parseInt(session.metadata!.numberOfTickets),
                        totalAmount: new Prisma.Decimal(session.metadata!.totalAmount),
                        status: ReservationStatus.Confirmed,
                        appliedPromoCode: session.metadata!.appliedPromoCode || null,
                        stripeSessionId: session.id,
                    },
                    include: {
                        event: true,
                        user: true
                    }
                });
            } else if (reservation.status !== ReservationStatus.Confirmed) {
                // Si la réservation existe mais n'est pas confirmée, la mettre à jour
                reservation = await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: { status: ReservationStatus.Confirmed },
                    include: {
                        event: true,
                        user: true
                    }
                });
            }

            // Mise à jour du code promo
            if (reservation.appliedPromoCode) {
                await prisma.promoCode.updateMany({
                    where: {
                        eventId: reservation.eventId,
                        code: reservation.appliedPromoCode,
                        used: false,
                    },
                    data: {
                        used: true,
                        usedById: reservation.userId,
                        usedAt: new Date()
                    }
                });
            }

            // Envoi de la confirmation
            if (reservation) {
                await sendReservationConfirmation(
                    reservation.user.email,
                    reservation.event.title,
                    reservation.numberOfTickets,
                    Number(reservation.totalAmount)
                );
            }

            // Vérifier si un paiement existe déjà pour cette réservation
            let payment = await prisma.payment.findUnique({
                where: { reservationId: reservation.id }
            });

            if (!payment) {
                // Créer le paiement seulement s'il n'existe pas déjà
                payment = await prisma.payment.create({
                    data: {
                        reservationId: reservation.id,
                        amount: new Prisma.Decimal((session.amount_total! / 100).toFixed(2)),
                        paymentDate: new Date(),
                        paymentMethod: 'Stripe',
                        status: PaymentStatus.Paid
                    }
                });
            }

            if (reservation.event) {
                await updateUserTotalRevenue(reservation.event.userId);
            }

            return {
                success: true,
                eventDetails: {
                    eventId: reservation.eventId,
                    title: reservation.event.title,
                    numberOfTickets: reservation.numberOfTickets,
                    totalAmount: reservation.totalAmount,
                    eventDate: reservation.event.event_date,
                    appliedPromoCode: reservation.appliedPromoCode,
                }
            };
        }
        return { success: false };
    } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        return { success: false };
    }
}