"use server";
import { connectToDatabase } from '@/lib/database';
import Rating from '@/lib/database/models/rating.model';

export async function getRatingByEventAndUser(eventId: string, userId: string) {
    await connectToDatabase();
    return Rating.findOne({ eventId, userId });
}
