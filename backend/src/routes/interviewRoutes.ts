import { Router } from 'express';
import { startInterviewSession, answerInterviewQuestion, getInterviewHistory, getInterviewDetails } from '../controllers/interviewController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { startInterviewSchema, answerInterviewSchema } from '../utils/validationSchemas';

const router = Router();

router.use(protect);

router.post('/start', validate(startInterviewSchema), startInterviewSession);
router.post('/session/:sessionId/answer', validate(answerInterviewSchema), answerInterviewQuestion);
router.get('/history', getInterviewHistory);
router.get('/session/:id', getInterviewDetails);

export default router;
