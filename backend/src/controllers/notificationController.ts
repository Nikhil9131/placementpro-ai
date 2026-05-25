import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import Notification from '../models/Notification';
import { CustomError } from '../utils/CustomError';

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(new CustomError('Notification not found', 404));
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
}

export async function clearAllNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
}
