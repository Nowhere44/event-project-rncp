// /api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createEvent, getEvents } from '@/actions/event';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const params: any = {
        page,
        limit,
        search: query || undefined,
        category: tags || undefined,
        isPaid: isPaid === 'true' ? true : isPaid === 'false' ? false : undefined,
        date: date ? new Date(date) : undefined
    };

    try {
        const { events, total, totalPages } = await getEvents(params);
        return NextResponse.json({ events, total, totalPages });
    } catch (error) {
        console.error('Error searching events:', error);
        return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
    }
}