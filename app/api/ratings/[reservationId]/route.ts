// app/api/ratings/[reservationId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';
import { updateEventRating, updateUserRating } from '@/lib/ratingUtils';
import { prisma } from '@/server/db';

export async function POST(
    request: Request,
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();

        const reservation = await prisma.reservation.findUnique({
            where: { id: params.reservationId },
            include: { event: true, user: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        await connectToDatabase();
        const updatedRating = await Rating.findOneAndUpdate(
            { reservationId: params.reservationId },
            {
                rating,
                comment,
                userId: session.user.id.toString(),
                eventId: reservation.event.id
            },
            { upsert: true, new: true }
        );

        await updateEventRating(reservation.event.id);
        await updateUserRating(reservation.user.id);

        return NextResponse.json(updatedRating);
    } catch (error) {
        console.error('Error creating/updating rating:', error);
        return NextResponse.json({ error: 'Error creating/updating rating' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();

        await connectToDatabase();
        const updatedRating = await Rating.findOneAndUpdate(
            { reservationId: params.reservationId },
            { rating, comment },
            { new: true }
        );

        if (!updatedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }

        await updateEventRating(updatedRating.eventId);
        await updateUserRating(session.user.id.toString());

        return NextResponse.json(updatedRating);
    } catch (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json({ error: 'Error updating rating' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        await connectToDatabase();
        const deletedRating = await Rating.findOneAndDelete({ reservationId: params.reservationId });

        if (!deletedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }

        await updateEventRating(deletedRating.eventId);
        await updateUserRating(session.user.id.toString());

        return NextResponse.json({ message: "Rating deleted successfully" });
    } catch (error) {
        console.error('Error deleting rating:', error);
        return NextResponse.json({ error: 'Error deleting rating' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: { reservationId: string } }
) {
    await connectToDatabase();
    const rating = await Rating.findOne({ reservationId: params.reservationId });
    return NextResponse.json(rating || null);
}