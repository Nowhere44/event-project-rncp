//actions/publicMessages/update.ts
import { prisma } from "@/server/db";

export async function updatePublicMessage(id: string, content: string) {
    return prisma.message.update({
        where: { id, type: 'public' },
        data: { content },
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
