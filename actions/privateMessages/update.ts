import { prisma } from "@/server/db";

export async function updatePrivateMessage(messageId: string, userId: string, content: string) {
    return prisma.privateMessage.updateMany({
        where: {
            id: messageId,
            senderId: userId,
        },
        data: {
            content,
        },
    });
}