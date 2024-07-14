import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";
import { sendVerificationStatusEmail } from '@/lib/email';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json();

    try {
        const updatedRequest = await prisma.verificationRequest.update({
            where: { id },
            data: {
                status,
                reviewedAt: new Date(),
                reviewedBy: session.user.id,
            },
            include: { user: true },
        });

        if (status === 'APPROVED') {
            await prisma.user.update({
                where: { id: updatedRequest.userId },
                data: { isVerified: true },
            });
        }

        // Envoyer un email à l'utilisateur
        await sendVerificationStatusEmail(updatedRequest.user.email, status);

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la demande de vérification:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}