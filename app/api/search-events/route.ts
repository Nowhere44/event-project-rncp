import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const tags = searchParams.get('tags');
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
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
    }
}