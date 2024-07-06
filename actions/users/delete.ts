"use server";
import { prisma } from "@/server/db";

export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        await prisma.$transaction(async (prisma) => {
            const userEvents = await prisma.event.findMany({
                where: { userId: id },
                select: { id: true }
            });

            const eventIds = userEvents.map(event => event.id);

            await prisma.promoCode.deleteMany({
                where: { eventId: { in: eventIds } }
            });

            await prisma.reservation.deleteMany({
                where: { eventId: { in: eventIds } }
            });

            await prisma.event.deleteMany({
                where: { userId: id }
            });

            await prisma.reservation.deleteMany({
                where: { userId: id }
            });

            await prisma.user.delete({
                where: { id }
            });
        });

        return true;
    } catch (error) {
        console.error("error deleting user:", error);
        return false;
    }
};