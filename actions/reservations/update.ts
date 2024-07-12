import { prisma } from "@/server/db";
import { ReservationStatus } from "@prisma/client";

export async function updateReservationStatus(id: string, status: ReservationStatus) {
    return prisma.reservation.update({
        where: { id },
        data: { status },
    });
}