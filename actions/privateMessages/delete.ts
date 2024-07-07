// actions/privateMessages/delete.ts
import { prisma } from "@/server/db";

export async function deletePrivateMessage(messageId: string, userId: string) {
    return prisma.privateMessage.deleteMany({
        where: {
            id: messageId,
            senderId: userId, // Assurez-vous que seul l'expéditeur peut supprimer le message
        },
    });
}