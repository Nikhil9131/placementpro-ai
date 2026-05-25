import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import aptitudeRoutes from './aptitudeRoutes';
import dsaRoutes from './dsaRoutes';
import resumeRoutes from './resumeRoutes';
import interviewRoutes from './interviewRoutes';
import roadmapRoutes from './roadmapRoutes';
import studyPlanRoutes from './studyPlanRoutes';
import adminRoutes from './adminRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/aptitude', aptitudeRoutes);
router.use('/dsa', dsaRoutes);
router.use('/resumes', resumeRoutes);
router.use('/interviews', interviewRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/study-plans', studyPlanRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;
