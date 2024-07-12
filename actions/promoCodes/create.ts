import { prisma } from "@/server/db";

export async function createPromoCodes(eventId: string, quantity: number, discount: number) {
    const promoCodes = [];
    for (let i = 0; i < quantity; i++) {
        const code = `PROMO${Math.random().toString(36).substring(2, 8).toUpperCase()}${discount}`;
        promoCodes.push({ code, discount, eventId });
    }

    await prisma.promoCode.createMany({ data: promoCodes });
    return promoCodes;
}