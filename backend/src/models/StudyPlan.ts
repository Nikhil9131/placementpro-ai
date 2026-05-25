import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyTask {
  id: string;
  day: number;
  title: string;
  category: 'aptitude' | 'dsa' | 'resume' | 'mock_interview' | 'revision';
  completed: boolean;
  completedAt?: Date;
}

export interface IStudyPlan extends Document {
  user: mongoose.Types.ObjectId;
  targetCompany: string;
  currentSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  availableTime: number; // in weeks
  placementDate: Date;
  dailyTasks: IDailyTask[];
  weeklyGoals: { week: number; goal: string; completed: boolean }[];
  revisionPlan: string[];
  mockTestSchedule: { testName: string; date: string; completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudyPlanSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetCompany: { type: String, required: true },
    currentSkillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    availableTime: { type: Number, required: true }, // in weeks
    placementDate: { type: Date, required: true },
    dailyTasks: [
      {
        id: { type: String, required: true },
        day: { type: Number, required: true },
        title: { type: String, required: true },
        category: { type: String, enum: ['aptitude', 'dsa', 'resume', 'mock_interview', 'revision'], required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    weeklyGoals: [
      {
        week: { type: Number, required: true },
        goal: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    revisionPlan: [{ type: String }],
    mockTestSchedule: [
      {
        testName: { type: String, required: true },
        date: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

StudyPlanSchema.index({ user: 1 });

export default mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
