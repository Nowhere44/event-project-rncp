import { prisma } from "@/server/db";

export async function createPrivateMessage(senderId: string, receiverId: string, content: string, type: string) {
    const now = new Date();
    const editableUntil = new Date(now.getTime() + 30 * 1000);

    return prisma.privateMessage.create({
        data: {
            senderId,
            receiverId,
            content,
            type,
            editableUntil,
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