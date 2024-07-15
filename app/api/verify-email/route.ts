import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.json({ error: "Token invalide" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
            },
        });

        return NextResponse.redirect(new URL('/login?verified=true', req.url));
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}