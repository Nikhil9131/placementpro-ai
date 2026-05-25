import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  atsScore: number;
  skillGap: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  extractedText: string;
  analyzedAt: Date;
}

const ResumeAnalysisSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    atsScore: { type: Number, required: true },
    skillGap: [{ type: String }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    extractedText: { type: String, required: true },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ResumeAnalysisSchema.index({ user: 1 });

export default mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);
