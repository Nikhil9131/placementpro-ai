import mongoose, { Schema, Document } from 'mongoose';

export type AptitudeCategory = 'quantitative' | 'logical' | 'verbal' | 'data_interpretation';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface IAptitudeQuestion extends Document {
  category: AptitudeCategory;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: DifficultyLevel;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AptitudeQuestionSchema: Schema = new Schema(
  {
    category: {
      type: String,
      enum: ['quantitative', 'logical', 'verbal', 'data_interpretation'],
      required: true,
    },
    questionText: { type: String, required: true },
    options: { type: [String], required: true, validate: [(opt: any) => opt.length >= 2, 'Options must have at least 2 elements'] },
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

AptitudeQuestionSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model<IAptitudeQuestion>('AptitudeQuestion', AptitudeQuestionSchema);
