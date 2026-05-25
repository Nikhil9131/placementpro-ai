import mongoose, { Schema, Document } from 'mongoose';

export type DsaTopic =
  | 'arrays'
  | 'strings'
  | 'linked_lists'
  | 'stacks'
  | 'queues'
  | 'trees'
  | 'graphs'
  | 'dynamic_programming'
  | 'greedy'
  | 'backtracking';

export interface IDsaQuestion extends Document {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: DsaTopic;
  description: string;
  constraints?: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  companyTags: string[];
  solutionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DsaQuestionSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    topic: {
      type: String,
      enum: [
        'arrays',
        'strings',
        'linked_lists',
        'stacks',
        'queues',
        'trees',
        'graphs',
        'dynamic_programming',
        'greedy',
        'backtracking',
      ],
      required: true,
    },
    description: { type: String, required: true },
    constraints: { type: String },
    inputFormat: { type: String },
    outputFormat: { type: String },
    sampleInput: { type: String },
    sampleOutput: { type: String },
    companyTags: [{ type: String, trim: true }],
    solutionUrl: { type: String },
  },
  { timestamps: true }
);

DsaQuestionSchema.index({ topic: 1 });
DsaQuestionSchema.index({ difficulty: 1 });
DsaQuestionSchema.index({ companyTags: 1 });

export default mongoose.model<IDsaQuestion>('DsaQuestion', DsaQuestionSchema);
