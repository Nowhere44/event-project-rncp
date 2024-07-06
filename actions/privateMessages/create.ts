//actions/privateMessages/create.ts
import { prisma } from "@/server/db";

export async function createPrivateMessage(senderId: string, receiverId: string, content: string) {
    return prisma.privateMessage.create({
        data: {
            senderId,
            receiverId,
            content,
            type: 'private',
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
    });
}