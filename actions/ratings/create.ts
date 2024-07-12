"use server";
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';
import { updateEventRating, updateUserRating } from '@/lib/ratingUtils';
import { prisma } from '@/server/db';

export async function createRating(userId: string, eventId: string, rating: number, comment: string) {
    await connectToDatabase();
    const newRating = new Rating({
        rating,
        comment,
        userId,
        eventId
    });
    await newRating.save();

    await updateEventRating(eventId);
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { user: true }
    });
    if (event) {
        await updateUserRating(event.user.id);
    }

    return newRating;
}
