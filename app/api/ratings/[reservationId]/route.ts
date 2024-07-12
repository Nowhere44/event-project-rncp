import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { createRating, updateEventRatingByUser, deleteEventRating, getRatingByEventAndUser } from '@/actions';
import { prisma } from '@/server/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();

        const reservation = await prisma.reservation.findUnique({
            where: { id: params.reservationId },
            include: { event: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        const newRating = await createRating(session.user.id, reservation.event.id, rating, comment);
        return NextResponse.json(newRating);
    } catch (error) {
        console.error('Error creating/updating rating:', error);
        return NextResponse.json({ error: 'Error creating/updating rating' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { rating, comment } = await request.json();

        const reservation = await prisma.reservation.findUnique({
            where: { id: params.reservationId },
            include: { event: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        const updatedRating = await updateEventRatingByUser(reservation.event.id, session.user.id, rating, comment);
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
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: params.reservationId },
            include: { event: true }
        });

        if (!reservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        const deletedRating = await deleteEventRating(reservation.event.id, session.user.id);
        if (!deletedRating) {
            return NextResponse.json({ error: "Rating not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Rating deleted successfully" });
    } catch (error) {
        console.error('Error deleting rating:', error);
        return NextResponse.json({ error: 'Error deleting rating' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { reservationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const reservation = await prisma.reservation.findUnique({
        where: { id: params.reservationId },
        include: { event: true }
    });

    if (!reservation) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const rating = await getRatingByEventAndUser(reservation.event.id, session.user.id);
    return NextResponse.json(rating || null);
}
