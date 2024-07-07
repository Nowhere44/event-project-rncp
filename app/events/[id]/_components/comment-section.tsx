import React from 'react';
import { connectToDatabase } from "@/lib/database";
import Rating from "@/lib/database/models/rating.model";
import { prisma } from "@/server/db";
import { formatDate } from "@/lib/utils";
import Image from 'next/image';

async function fetchComments(eventId: string) {
    await connectToDatabase();
    const comments = await Rating.find({ eventId });
    return comments;
}

async function fetchUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { first_name: true, last_name: true, profile_picture: true },
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
        <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold leading-7 text-gray-900 mb-6">Commentaires</h2>
                {commentsWithUserDetails.length > 0 ? (
                    <ul role="list" className="space-y-6">
                        {commentsWithUserDetails.map((comment, index) => (
                            <li key={comment._id} className="relative flex gap-x-4">
                                <div className={`absolute left-0 top-0 flex w-6 justify-center ${index === commentsWithUserDetails.length - 1 ? 'h-6' : '-bottom-6'
                                    }`}>
                                    <div className="w-px bg-gray-200"></div>
                                </div>
                                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                                    <Image src={comment.userDetails?.profile_picture} className="h-6 w-6 text-gray-400" aria-hidden="true" alt='profile-picture'
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                                    <div className="flex justify-between gap-x-4">
                                        <div className="py-0.5 text-xs leading-5 text-gray-500">
                                            <span className="font-medium text-gray-900">
                                                {comment.userDetails?.first_name} {comment.userDetails?.last_name}
                                            </span> a commenté
                                        </div>
                                        <time dateTime={comment.createdAt} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                                            {formatDate(comment.createdAt)}
                                        </time>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-gray-500">{comment.comment}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 italic">Aucun commentaire pour le moment.</p>
                )}
            </div>
        </div>
    );
}