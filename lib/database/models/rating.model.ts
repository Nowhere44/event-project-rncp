//lib/database/models/rating.model.ts
import { Schema, model, models, Document } from "mongoose";

export interface IRating extends Document {
    eventId: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}

const RatingSchema = new Schema({
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Rating = models.Rating || model<IRating>("Rating", RatingSchema);

export default Rating;