//api/user-events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    }

    try {
        const events = await prisma.event.findMany({
            where: { userId },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                },
                reservations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching user events:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des événements de l\'utilisateur' }, { status: 500 });
    }
}