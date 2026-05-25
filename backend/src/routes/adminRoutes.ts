import { Router } from 'express';
import { getPlatformAnalytics, getUsers, createAptitudeQuestion, createDsaQuestion, createOrUpdateRoadmap } from '../controllers/adminController';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createAptitudeQuestionSchema, createDsaQuestionSchema } from '../utils/validationSchemas';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/users', getUsers);
router.post('/aptitude', validate(createAptitudeQuestionSchema), createAptitudeQuestion);
router.post('/dsa', validate(createDsaQuestionSchema), createDsaQuestion);
router.post('/roadmap', createOrUpdateRoadmap);

export default router;
