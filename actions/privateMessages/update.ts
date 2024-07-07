// actions/privateMessages/update.ts
import { prisma } from "@/server/db";

export async function updatePrivateMessage(messageId: string, userId: string, content: string) {
    return prisma.privateMessage.updateMany({
        where: {
            id: messageId,
            senderId: userId, // Assurez-vous que seul l'expéditeur peut modifier le message
        },
        data: {
            content,
        },
    });
}