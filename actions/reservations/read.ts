import { prisma } from "@/server/db";
import { Reservation, ReservationStatus } from "@prisma/client";

export async function getReservationById(id: string): Promise<Reservation | null> {
    return prisma.reservation.findUnique({
        where: { id },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    start_time: true,
                    end_time: true,
                    event_date: true,
                    images: true
                }
            },
        }
    });
}

export async function getReservationsByEventId(eventId: string, userId: string): Promise<Reservation[]> {
    return prisma.reservation.findMany({
        where: {
            eventId,
            userId,
            status: {
                in: [ReservationStatus.Confirmed, ReservationStatus.Pending]
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
                    images: true
                }
            },
        }
    });
}

export async function getUserReservationsForEvent(userId: string, eventId: string): Promise<Reservation[]> {
    return prisma.reservation.findMany({
        where: {
            userId,
            eventId,
            status: {
                in: [ReservationStatus.Confirmed, ReservationStatus.Pending]
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
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
    return prisma.reservation.findMany({
        where: {
            userId,
            status: {
                not: ReservationStatus.Cancelled
            },
            numberOfTickets: {
                gt: 0
            }
        },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    start_time: true,
                    images: true
                }
            },
        }
    });
}
