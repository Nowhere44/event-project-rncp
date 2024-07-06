//actions/publicMessages/create.ts
import { prisma } from "@/server/db";

export async function createPublicMessage(content: string, userId: string) {
    return prisma.message.create({
        data: {
            content,
            type: 'public',
            userId,
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
