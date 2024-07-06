// actions/ratings/delete.ts
"use server";
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';
import { updateEventRating, updateUserRating } from '@/lib/ratingUtils';

export async function deleteEventRating(eventId: string, userId: string) {
    await connectToDatabase();
    const deletedRating = await Rating.findOneAndDelete({ eventId, userId });

    if (deletedRating) {
        await updateEventRating(eventId);
        await updateUserRating(userId);
    }

    return deletedRating;
}
