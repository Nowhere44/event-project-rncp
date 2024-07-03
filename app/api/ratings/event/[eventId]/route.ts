//api/ratings/events/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';
import { updateEventRating, updateUserRating } from '@/lib/ratingUtils';
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

        const event = await prisma.event.findUnique({
            where: { id: params.eventId },
            include: { user: true }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        await connectToDatabase();
        const newRating = new Rating({
            rating,
            comment,
            userId: session.user.id,
            eventId: params.eventId
        });
        await newRating.save();

        await updateEventRating(params.eventId);
        await updateUserRating(event.user.id);

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
        await connectToDatabase();
        const rating = await Rating.findOne({
            eventId: params.eventId,
            userId: session.user.id
        });
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

        await connectToDatabase();
        const updatedRating = await Rating.findOneAndUpdate(
            { eventId: params.eventId, userId: session.user.id },
            { rating, comment },
            { new: true }
        );

        if (!updatedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }

        await updateEventRating(params.eventId);
        await updateUserRating(session.user.id);

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
        await connectToDatabase();
        const deletedRating = await Rating.findOneAndDelete({
            eventId: params.eventId,
            userId: session.user.id
        });

        if (!deletedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }

        await updateEventRating(params.eventId);
        await updateUserRating(session.user.id);

        return NextResponse.json({ message: "Rating deleted successfully" });
    } catch (error) {
        console.error('Error deleting rating:', error);
        return NextResponse.json({ error: 'Error deleting rating' }, { status: 500 });
    }
}