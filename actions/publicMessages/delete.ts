import { prisma } from "@/server/db";

export async function deletePublicMessage(id: string) {
    try {
        const message = await prisma.message.findUnique({
            where: {
                id,
                type: { in: ['public', 'text', 'gif'] }
            }
        });

        if (!message) {
            return null;
        }

        return await prisma.message.delete({
            where: {
                id,
                type: { in: ['public', 'text', 'gif'] }
            }
        });
    } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }
}