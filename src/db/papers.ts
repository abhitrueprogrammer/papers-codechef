import mongoose, { Schema, Document, Model } from "mongoose";
import { IPaper } from "@/interface";

const paperSchema = new Schema<IPaper>({
  file: { type: String, required: true },
  subject: { type: String, required: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  exam: { type: String, enum: ["cat1", "cat2", "fat"], required: true },
});

const Paper: Model<IPaper> =
  mongoose.models.Paper ?? mongoose.model<IPaper>("Paper", paperSchema);

export default Paper;
