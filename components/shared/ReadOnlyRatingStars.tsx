import React from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

interface ReadOnlyRatingStarsProps {
    rating: number;
}

const ReadOnlyRatingStars: React.FC<ReadOnlyRatingStarsProps> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((star) => (
                <StarIcon
                    key={star}
                    className={`${star < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'
                        } h-5 w-5 flex-shrink-0`}
                    aria-hidden="true"
                />
            ))}
        </div>
    );
};

export default ReadOnlyRatingStars;