import { prisma } from "@/server/db";
import { connectToDatabase } from './database';
import Rating from './database/models/rating.model';

export async function calculateAverageRating(eventId: string) {
    await connectToDatabase();
    const ratings = await Rating.find({ eventId });
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
}

export async function updateEventRating(eventId: string) {
    const averageRating = await calculateAverageRating(eventId);
    await prisma.event.update({
        where: { id: eventId },
        data: { averageRating },
    });
}

export async function updateUserRating(userId: string) {
    const events = await prisma.event.findMany({
        where: { userId },
        select: { id: true, averageRating: true }
    });

    let totalRating = 0;
    let ratedEventsCount = 0;

    for (const event of events) {
        if (event.averageRating !== null) {
            totalRating += event.averageRating;
            ratedEventsCount++;
        }
    }

    const averageRating = ratedEventsCount > 0 ? totalRating / ratedEventsCount : null;

    await prisma.user.update({
        where: { id: userId },
        data: { averageRating },
    });
}