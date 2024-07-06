"use server";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";
import { Prisma, ReservationStatus, PaymentStatus } from "@prisma/client";

export const updateUser = async (id: string, userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_picture?: string;
}) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: userData,
        });
        revalidatePath(`/profile/${id}`);
        return updatedUser;
    } catch (error) {
        console.error("error updating user:", error);
        return null;
    }
};

export async function updateUserTotalRevenue(userId: string) {
    const userEvents = await prisma.event.findMany({
        where: { userId },
        include: {
            reservations: {
                where: {
                    status: ReservationStatus.Confirmed
                },
                include: {
                    payment: true
                }
            }
        }
    });

    let totalRevenue = 0;

    for (const event of userEvents) {
        for (const reservation of event.reservations) {
            if (reservation.payment && reservation.payment.status === PaymentStatus.Paid) {
                totalRevenue += Number(reservation.totalAmount);
            }
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { totalRevenue: new Prisma.Decimal(totalRevenue.toFixed(2)) }
    });

    return totalRevenue;
}