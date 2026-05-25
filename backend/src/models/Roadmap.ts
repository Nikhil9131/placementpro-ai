import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'book';
}

export interface IRoadmap extends Document {
  companyName: string;
  aptitudeTopics: string[];
  dsaTopics: string[];
  interviewQuestions: string[];
  resources: IRoadmapResource[];
  estimatedTimeline: string;
  dailyTasks: string[];
}

const RoadmapSchema: Schema = new Schema(
  {
    companyName: { type: String, required: true, unique: true, trim: true },
    aptitudeTopics: [{ type: String }],
    dsaTopics: [{ type: String }],
    interviewQuestions: [{ type: String }],
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['video', 'article', 'documentation', 'book'], default: 'article' },
      },
    ],
    estimatedTimeline: { type: String, required: true },
    dailyTasks: [{ type: String }],
  },
  { timestamps: true }
);

RoadmapSchema.index({ companyName: 1 });

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
