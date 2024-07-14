import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/server/db";
import { uploadToS3 } from '@/lib/s3Upload';
import { sendAdminNotificationEmail } from '@/lib/email';


export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const pendingRequest = await prisma.verificationRequest.findFirst({
            where: {
                userId: session.user.id,
                status: 'PENDING',
                isArchived: false,
            },
        });

        return NextResponse.json({ hasPendingRequest: !!pendingRequest });
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // Vérifier s'il existe déjà une demande non archivée
        const existingRequest = await prisma.verificationRequest.findFirst({
            where: {
                userId: session.user.id,
                isArchived: false,
            },
        });

        if (existingRequest) {
            if (existingRequest.status !== 'APPROVED') {
                const formData = await req.formData();
                const file = formData.get('idDocument') as File | null;

                if (!file) {
                    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
                }

                // Vérifier le type de fichier
                const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
                }

                // Vérifier la taille du fichier (5 MB max)
                if (file.size > 5 * 1024 * 1024) {
                    return NextResponse.json({ error: 'Le fichier est trop volumineux' }, { status: 400 });
                }


                const fileUrl = await uploadToS3(file);

                const updatedRequest = await prisma.verificationRequest.update({
                    where: { id: existingRequest.id },
                    data: {
                        idDocumentUrl: fileUrl,
                        status: 'PENDING',
                        submittedAt: new Date(),
                    },
                });

                await sendAdminNotificationEmail();

                return NextResponse.json(updatedRequest, { status: 200 });
            } else {
                return NextResponse.json({ error: 'Une demande approuvée existe déjà' }, { status: 400 });
            }
        }

        // Si aucune demande n'existe, créer une nouvelle
        const formData = await req.formData();
        const file = formData.get('idDocument') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
        }

        // Vérifier le type de fichier
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
        }

        // Vérifier la taille du fichier (5 MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Le fichier est trop volumineux' }, { status: 400 });
        }


        const fileUrl = await uploadToS3(file);

        const verificationRequest = await prisma.verificationRequest.create({
            data: {
                userId: session.user.id,
                idDocumentUrl: fileUrl,
                status: 'PENDING',
            },
        });

        await sendAdminNotificationEmail();

        return NextResponse.json(verificationRequest, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de la création/mise à jour de la demande de vérification:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}