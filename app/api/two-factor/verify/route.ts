//api/two-factor/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";
import { verifyToken } from '@/lib/twoFactor';
import speakeasy from 'speakeasy';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { token } = await req.json();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || !user.twoFactorSecret) {
        return NextResponse.json({ error: 'Configuration 2FA non trouvée' }, { status: 400 });
    }
    console.log('Secret stocké:', user.twoFactorSecret);
    console.log('Token reçu:', token);

    const currentToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32'
    });
    const previousToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        time: Date.now() / 1000 - 30
    });
    const nextToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        time: Date.now() / 1000 + 30
    });

    console.log('Tokens attendus:', {
        previous: previousToken,
        current: currentToken,
        next: nextToken
    });

    const isValid = verifyToken(user.twoFactorSecret, token);
    console.log('Résultat de la vérification:', isValid);

    if (isValid) {
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: true }
        });
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
    }
}