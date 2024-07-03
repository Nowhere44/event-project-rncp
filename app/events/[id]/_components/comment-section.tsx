// app/events/[id]/CommentSection.tsx
import { connectToDatabase } from "@/lib/database";
import Rating from "@/lib/database/models/rating.model";
import { prisma } from "@/server/db";
import { formatDate } from "@/lib/utils";

async function fetchComments(eventId: string) {
    await connectToDatabase();
    const comments = await Rating.find({ eventId });
    return comments;
}

async function fetchUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { first_name: true, last_name: true },
    });
    return user;
}

export async function CommentSection({ eventId }: { eventId: string }) {
    const comments = await fetchComments(eventId);

    const commentsWithUserDetails = await Promise.all(
        comments.map(async (comment) => {
            const userDetails = await fetchUserDetails(comment.userId);
            return { ...comment.toObject(), userDetails };
        })
    );

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Commentaires</h3>
            {commentsWithUserDetails.length > 0 ? (
                <ul>
                    {commentsWithUserDetails.map((comment) => (
                        <li key={comment._id} className="mb-4">
                            <p className="font-semibold">
                                {comment.userDetails?.first_name} {comment.userDetails?.last_name}
                            </p>
                            <p className="text-gray-600">{comment.comment}</p>
                            <p className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun commentaire pour le moment.</p>
            )}
        </div>
    );
}