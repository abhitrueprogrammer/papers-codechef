import mongoose, { Schema, type Model } from "mongoose";
import { type IPaper } from "@/interface";

const paperSchema = new Schema<IPaper>({
  public_id_cloudinary: {type: String, required: true},
  finalUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  subject: { type: String, required: true, index: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  exam: { type: String, enum: ["CAT-1", "CAT-2", "FAT"], required: true },
  isSelected: { type: Boolean, default: false },
});

paperSchema.index({ subject: 1 });

export const PaperAdmin: Model<IPaper> =
  mongoose.models.Admin ?? mongoose.model<IPaper>("Admin", paperSchema);
const Paper: Model<IPaper> =
  mongoose.models.Paper  ?? mongoose.model<IPaper>("Paper", paperSchema);

export default Paper;

