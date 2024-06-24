import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createEvent } from '@/actions/event';
import { prisma } from '@/server/db';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const eventData = await req.json();
        console.log('Received event data:', eventData);
        const event = await createEvent(eventData, session.user.id);
        console.log('Created event:', event);
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({
            error: 'Erreur lors de la création de l\'événement',
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');
    const tags = searchParams.get('category');
    const date = searchParams.get('date');
    const isPaid = searchParams.get('isPaid');

    const where: any = {};

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (tags) {
        where.tags = {
            some: {
                tag: {
                    name: { in: tags.split(',') },
                },
            },
        };
    }

    where.event_date = {
        gte: new Date(),
    };

    if (date) {
        where.event_date = {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        };
    }


    if (isPaid !== null) {
        where.is_paid = isPaid === 'true';
    }

    try {
        const events = await prisma.event.findMany({
            where,
            include: { tags: { include: { tag: true } } },
        });
        const total = await prisma.event.count({ where });
        return NextResponse.json({ events, total, totalPages: Math.ceil(total / 10) });
    } catch (error) {
        console.error('Error searching events:', error);
        return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
    }
}