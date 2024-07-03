import { Schema, model, models, Document } from "mongoose";

export interface ITrend extends Document {
    type: string;
    name: string;
    count: number;
    updatedAt: Date;
}

const TrendSchema = new Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

const Trend = models.Trend || model('Trend', TrendSchema);

export default Trend;