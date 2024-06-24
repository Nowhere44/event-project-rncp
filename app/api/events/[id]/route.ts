import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import { getEventById, updateEvent, deleteEvent } from '@/actions/event';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const event = await getEventById(params.id);
        if (!event) {
            return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
        }
        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({
            error: 'Erreur lors de la récupération de lévénement'
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const eventData = await req.json();
        const event = await updateEvent(params.id, eventData, session.user.id);
        return NextResponse.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({
            error: 'Erreur lors de la mise à jour de lévénement'
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        await deleteEvent(params.id, session.user.id);
        return NextResponse.json({ message: 'Événement supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({
            error: 'Erreur lors de la suppression de lévénement'
        }, { status: 500 });
    }
}