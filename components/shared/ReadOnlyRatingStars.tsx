import React from 'react';
import { Star } from 'lucide-react';

interface ReadOnlyRatingStarsProps {
    rating: number;
}

const ReadOnlyRatingStars: React.FC<ReadOnlyRatingStarsProps> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
};

export default ReadOnlyRatingStars;