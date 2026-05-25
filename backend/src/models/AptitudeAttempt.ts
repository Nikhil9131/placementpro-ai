import mongoose, { Schema, Document } from 'mongoose';

export interface IAptitudeAttemptQuestion {
  questionId: mongoose.Types.ObjectId;
  selectedAnswerIndex: number;
  isCorrect: boolean;
}

export interface IAptitudeAttempt extends Document {
  user: mongoose.Types.ObjectId;
  category?: string; // Optional if attempting a mixed test
  questions: IAptitudeAttemptQuestion[];
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  completedAt: Date;
}

const AptitudeAttemptSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },
        selectedAnswerIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // duration of test in seconds
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AptitudeAttemptSchema.index({ user: 1 });

export default mongoose.model<IAptitudeAttempt>('AptitudeAttempt', AptitudeAttemptSchema);
