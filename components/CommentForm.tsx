import React, { useState } from 'react';
import InteractiveRatingStars from './shared/InteractiveRatingStars';

interface CommentFormProps {
    onSubmit: (rating: number, comment: string) => void;
    initialRating?: number;
    initialComment?: string;
    onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, initialRating = 0, initialComment = '', onCancel }) => {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rating, comment);
        setRating(0);
        setComment('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <InteractiveRatingStars rating={rating} onRatingChange={setRating} />
            </div>
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Commentaire
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
            </div>
            <div className="flex justify-between">
                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Soumettre
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
};

export default CommentForm;