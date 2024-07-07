//actions/publicMessages/update.ts
import { prisma } from "@/server/db";

export async function updatePublicMessage(id: string, content: string) {
    try {
        return await prisma.message.update({
            where: {
                id,
                type: { in: ['public', 'text', 'gif'] }
            },
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
    } catch (error) {
        console.error("Error updating message:", error);
        throw error;
    }
}