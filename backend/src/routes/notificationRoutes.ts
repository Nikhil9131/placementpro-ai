import { Router } from 'express';
import { getNotifications, markNotificationRead, clearAllNotifications } from '../controllers/notificationController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.delete('/clear', clearAllNotifications);

export default router;
