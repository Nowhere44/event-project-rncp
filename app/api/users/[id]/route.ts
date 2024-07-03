// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { prisma } from '@/server/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                profile_picture: true,
                role: true,
                totalRevenue: true,
                events: {
                    where: {
                        is_paid: true
                    },
                    include: {
                        reservations: {
                            where: {
                                status: 'Confirmed'
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Si l'utilisateur demande ses propres informations, renvoyer toutes les données
        // Sinon, omettre les informations sensibles comme le revenu total
        if (session.user.id === user.id) {
            const hasReservations = user.events.some(event => event.reservations.length > 0);
            return NextResponse.json({
                ...user,
                hasReservations
            });
        } else {
            const { totalRevenue, events, ...publicUserInfo } = user;
            return NextResponse.json(publicUserInfo);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération de l\'utilisateur' }, { status: 500 });
    }
}