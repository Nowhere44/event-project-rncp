//actions/publicMessages/read.ts
import { prisma } from "@/server/db";

export async function getPublicMessages() {
    return prisma.message.findMany({
        where: {
            type: { in: ['public', 'text', 'gif'] }
        },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}
