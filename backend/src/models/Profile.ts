import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog {
  date: string; // YYYY-MM-DD
  count: number; // number of activities solved
}

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  skills: string[];
  targetCompanies: string[];
  graduationYear?: number;
  bio?: string;
  contactNumber?: string;
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    grade?: string;
    duration: string;
  }[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    link?: string;
  }[];
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  weeklyActivity: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [{ type: String, trim: true }],
    targetCompanies: [{ type: String, trim: true }],
    graduationYear: { type: Number },
    bio: { type: String },
    contactNumber: { type: String },
    experience: [
      {
        role: { type: String, required: true },
        company: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String },
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        grade: { type: String },
        duration: { type: String, required: true },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        techStack: [{ type: String }],
        link: { type: String },
      },
    ],
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: String },
    weeklyActivity: [
      {
        date: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

ProfileSchema.index({ user: 1 });

export default mongoose.model<IProfile>('Profile', ProfileSchema);
