import { prisma } from "@/server/db";

export async function deleteEvent(eventId: string, userId: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { reservations: true, tags: true }
        });

        if (!event || event.userId !== userId) {
            throw new Error('Non autorisé à supprimer cet événement');
        }

        await prisma.eventTag.deleteMany({
            where: { eventId }
        });

        await prisma.reservation.deleteMany({
            where: { eventId }
        });

        await prisma.promoCode.deleteMany({
            where: { eventId }
        });

        await prisma.event.delete({
            where: { id: eventId }
        });

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        throw error;
    }
}