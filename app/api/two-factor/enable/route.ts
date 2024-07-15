//api/two-factor/enable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";
import { generateSecret, generateQRCode } from '@/lib/twoFactor';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const secret = generateSecret(session.user.email);
    const qrCode = await generateQRCode(secret.base32);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: secret.base32 }
    });

    return NextResponse.json({ secret: secret.base32, qrCode });
}