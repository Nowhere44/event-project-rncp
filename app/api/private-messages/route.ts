// app/api/private-messages/route.ts
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
    const otherUserId = searchParams.get('otherUserId');

    if (!otherUserId) {
        return NextResponse.json({ error: 'otherUserId is required' }, { status: 400 });
    }

    try {
        const messages = await prisma.privateMessage.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: session.user.id },
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        first_name: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        first_name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching private messages:', error);
        return NextResponse.json({ error: 'Error fetching private messages' }, { status: 500 });
    }
}