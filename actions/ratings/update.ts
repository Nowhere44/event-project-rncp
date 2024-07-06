// actions/ratings/update.ts
"use server";
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';
import { updateEventRating, updateUserRating } from '@/lib/ratingUtils';

export async function updateEventRatingByUser(eventId: string, userId: string, rating: number, comment: string) {
    await connectToDatabase();
    const updatedRating = await Rating.findOneAndUpdate(
        { eventId, userId },
        { rating, comment },
        { new: true }
    );

    if (updatedRating) {
        await updateEventRating(eventId);
        await updateUserRating(userId);
    }

    return updatedRating;
}
