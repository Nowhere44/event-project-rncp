import React from 'react';
import { Star } from 'lucide-react';

interface InteractiveRatingStarsProps {
    rating: number;
    onRatingChange: (rating: number) => void;
}

const InteractiveRatingStars: React.FC<InteractiveRatingStarsProps> = ({ rating, onRatingChange }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`cursor-pointer ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    onClick={() => onRatingChange(star)}
                />
            ))}
        </div>
    );
};

export default InteractiveRatingStars;