import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const events = await prisma.event.findMany({
            where: { userId: userId },
            include: { tags: { include: { tag: true } } },
        });
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching user events' }, { status: 500 });
    }
}