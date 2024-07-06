// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { createEvent, getEvents } from '@/actions';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const eventData = await req.json();
        const event = await createEvent(eventData, session.user.id);
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
    const params = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        isPaid: searchParams.get('isPaid') === 'true' ? true : searchParams.get('isPaid') === 'false' ? false : undefined,
        date: searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10')
    };

    try {
        const { events, total, totalPages } = await getEvents(params);
        return NextResponse.json({ events, total, totalPages });
    } catch (error) {
        console.error('Error searching events:', error);
        return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
    }
}