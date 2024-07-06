import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { createRating, deleteEventRating, getRatingByEventAndUser, updateEventRatingByUser } from '@/actions';
import { prisma } from '@/server/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();
        const event = await prisma.event.findUnique({ where: { id: params.eventId } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        const newRating = await createRating(session.user.id, params.eventId, rating, comment);
        return NextResponse.json(newRating);
    } catch (error) {
        console.error('Error creating rating:', error);
        return NextResponse.json({ error: 'Error creating rating' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const rating = await getRatingByEventAndUser(params.eventId, session.user.id);
        return NextResponse.json(rating || null);
    } catch (error) {
        console.error('Error fetching rating:', error);
        return NextResponse.json({ error: 'Error fetching rating' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();
        const updatedRating = await updateEventRatingByUser(params.eventId, session.user.id, rating, comment);
        if (!updatedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }
        return NextResponse.json(updatedRating);
    } catch (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json({ error: 'Error updating rating' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const deletedRating = await deleteEventRating(params.eventId, session.user.id);
        if (!deletedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Rating deleted successfully" });
    } catch (error) {
        console.error('Error deleting rating:', error);
        return NextResponse.json({ error: 'Error deleting rating' }, { status: 500 });
    }
}
