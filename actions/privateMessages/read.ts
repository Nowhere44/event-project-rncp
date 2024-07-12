import { prisma } from "@/server/db";

export async function getPrivateMessages(userId: string, otherUserId: string) {
    return prisma.privateMessage.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        },
        include: {
            sender: {
                select: {
                    id: true,
                    first_name: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    first_name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
}