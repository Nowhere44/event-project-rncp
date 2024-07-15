//api/users/%5Bid%5D/2fa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { generateSecret, generateQRCode } from '@/lib/twoFactor';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { enable } = await req.json();

    try {
        if (enable) {
            const secret = generateSecret(`YourApp:${session.user.email}`);
            const qrCode = await generateQRCode(secret.base32);

            await prisma.user.update({
                where: { id: params.id },
                data: {
                    twoFactorSecret: secret.base32,
                    twoFactorEnabled: true
                }
            });

            return NextResponse.json({
                twoFactorEnabled: true,
                twoFactorSecret: secret.base32,
                qrCode
            });
        } else {
            await prisma.user.update({
                where: { id: params.id },
                data: {
                    twoFactorSecret: null,
                    twoFactorEnabled: false
                }
            });

            return NextResponse.json({ twoFactorEnabled: false });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du 2FA:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}