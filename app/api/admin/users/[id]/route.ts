import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    try {
        // Supprimer d'abord les demandes de vérification associées
        await prisma.verificationRequest.deleteMany({
            where: { userId: id },
        });

        // Ensuite, supprimer l'utilisateur
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}