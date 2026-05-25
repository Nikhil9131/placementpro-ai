import { Router } from 'express';
import { generateUserStudyPlan, getActiveStudyPlan, toggleTaskCompletion } from '../controllers/studyPlanController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { generateStudyPlanSchema } from '../utils/validationSchemas';

const router = Router();

router.use(protect);

router.post('/generate', validate(generateStudyPlanSchema), generateUserStudyPlan);
router.get('/active', getActiveStudyPlan);
router.post('/:planId/tasks/:taskId/toggle', toggleTaskCompletion);

export default router;
