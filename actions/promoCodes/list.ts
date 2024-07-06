//actions/promoCodes/list.ts
import { prisma } from "@/server/db";

export async function listPromoCodes(eventId: string) {
    const promoCodes = await prisma.promoCode.findMany({
        where: { eventId },
        include: {
            usedByUser: {
                select: {
                    first_name: true,
                    last_name: true
                }
            }
        }
    });
    return promoCodes;
}