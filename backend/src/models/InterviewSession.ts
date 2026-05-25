import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export interface IInterviewQuestionEvaluation {
  questionText: string;
  candidateAnswer: string;
  feedback?: string;
  scores?: {
    technical: number;
    communication: number;
    confidence: number;
  };
}

export interface IInterviewSession extends Document {
  user: mongoose.Types.ObjectId;
  type: 'software_engineer' | 'frontend_developer' | 'backend_developer' | 'full_stack_developer' | 'data_analyst';
  status: 'in_progress' | 'completed';
  chatHistory: IInterviewMessage[];
  evaluations: IInterviewQuestionEvaluation[];
  overallFeedback?: string;
  scores?: {
    technical: number;
    communication: number;
    confidence: number;
    final: number;
  };
  startedAt: Date;
  endedAt?: Date;
}

const InterviewSessionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['software_engineer', 'frontend_developer', 'backend_developer', 'full_stack_developer', 'data_analyst'],
      required: true,
    },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    chatHistory: [
      {
        role: { type: String, enum: ['interviewer', 'candidate'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    evaluations: [
      {
        questionText: { type: String, required: true },
        candidateAnswer: { type: String, required: true },
        feedback: { type: String },
        scores: {
          technical: { type: Number },
          communication: { type: Number },
          confidence: { type: Number },
        },
      },
    ],
    overallFeedback: { type: String },
    scores: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      final: { type: Number, default: 0 },
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

InterviewSessionSchema.index({ user: 1 });

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
