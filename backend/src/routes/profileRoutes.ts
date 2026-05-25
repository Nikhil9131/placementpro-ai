import { Router } from 'express';
import { getProfile, updateProfile, getDashboardStats } from '../controllers/profileController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/dashboard', getDashboardStats);

export default router;
