import { Schema, model, models, Document } from "mongoose";

export interface IBadge extends Document {
    userId: string;
    name: string;
    description: string;
    imageUrl: string;
    earnedAt: Date;
}

const BadgeSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now }
});

const Badge = models.Badge || model('Badge', BadgeSchema);

export default Badge;