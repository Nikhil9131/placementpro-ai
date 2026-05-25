import { Router } from 'express';
import { getDsaQuestions, toggleDsaProgress, getDsaStats } from '../controllers/dsaController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/questions', getDsaQuestions);
router.post('/questions/:questionId/progress', toggleDsaProgress);
router.get('/stats', getDsaStats);

export default router;
