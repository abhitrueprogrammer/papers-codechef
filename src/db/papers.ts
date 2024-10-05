import mongoose, { Schema, type Model } from "mongoose";
import { type IPaper } from "@/interface";

const paperSchema = new Schema<IPaper>({
  finalUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  subject: { type: String, required: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  exam: { type: String, enum: ["cat1", "cat2", "fat"], required: true },
});

const Paper: Model<IPaper> =
  mongoose.models.Paper ?? mongoose.model<IPaper>("Paper", paperSchema);

export default Paper;
