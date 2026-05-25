import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  type: 'streak' | 'roadmap' | 'interview' | 'aptitude' | 'dsa';
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['streak', 'roadmap', 'interview', 'aptitude', 'dsa'], required: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
