import { prisma } from "@/server/db";

export async function createPublicMessage(content: string, userId: string, type: string) {
    const now = new Date();
    const editableUntil = new Date(now.getTime() + 30 * 1000);

    return prisma.message.create({
        data: {
            content,
            type,
            userId,
            editableUntil,
        },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                }
            }
        }
    });
}