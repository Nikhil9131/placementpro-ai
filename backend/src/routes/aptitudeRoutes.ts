import { Router } from 'express';
import { getAptitudeQuestions, startAptitudeTest, submitAptitudeAttempt, getAptitudeLeaderboard } from '../controllers/aptitudeController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/questions', getAptitudeQuestions);
router.post('/start', startAptitudeTest);
router.post('/submit', submitAptitudeAttempt);
router.get('/leaderboard', getAptitudeLeaderboard);

export default router;
