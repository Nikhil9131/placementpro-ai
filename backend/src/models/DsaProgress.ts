import mongoose, { Schema, Document } from 'mongoose';

export interface IDsaProgress extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  status: 'solved' | 'revision_needed';
  notes?: string;
  solvedAt: Date;
}

const DsaProgressSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'DsaQuestion', required: true },
    status: { type: String, enum: ['solved', 'revision_needed'], default: 'solved' },
    notes: { type: String },
    solvedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness and high performance
DsaProgressSchema.index({ user: 1, question: 1 }, { unique: true });

export default mongoose.model<IDsaProgress>('DsaProgress', DsaProgressSchema);
