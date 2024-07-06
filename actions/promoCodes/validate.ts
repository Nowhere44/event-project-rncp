//actions/promoCodes/validate.ts
import { prisma } from "@/server/db";

export async function validatePromoCode(eventId: string, promoCode: string) {
    const validPromoCode = await prisma.promoCode.findFirst({
        where: {
            eventId: eventId,
            code: promoCode,
            used: false,
        },
    });

    if (validPromoCode) {
        return { discount: validPromoCode.discount };
    } else {
        throw new Error('Code promo invalide ou déjà utilisé');
    }
}