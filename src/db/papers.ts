import mongoose, { Document, Schema, Model } from 'mongoose';

interface IPaper extends Document {
  file: Buffer;
  subject: string;
  slot: string;
  year: string;
  exam: 'cat1' | 'cat2' | 'fat';
}

const PaperSchema: Schema<IPaper> = new Schema({
  file: {
    type: Buffer,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  exam: {
    type: String,
    enum: ['cat1', 'cat2', 'fat'],
    required: true,
  },
});

const Paper:Model<IPaper> = mongoose.models.Paper || mongoose.model('Paper', PaperSchema);

export default Paper;
