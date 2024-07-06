import React, { useState } from 'react';
import InteractiveRatingStars from './shared/InteractiveRatingStars';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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
                <Label htmlFor="rating">Note</Label>
                <InteractiveRatingStars rating={rating} onRatingChange={setRating} />
            </div>
            <div>
                <Label htmlFor="comment">Commentaire</Label>
                <Textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>
            <div className="flex justify-between">
                <Button type="submit">
                    Soumettre
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Annuler
                    </Button>
                )}
            </div>
        </form>
    );
};

export default CommentForm;