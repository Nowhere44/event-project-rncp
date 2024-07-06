//actions/publicMessages/delete.ts
import { prisma } from "@/server/db";

export async function deletePublicMessage(id: string) {
    return prisma.message.delete({
        where: { id, type: 'public' }
    });
}
