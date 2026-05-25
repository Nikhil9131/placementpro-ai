import { Router } from 'express';
import multer from 'multer';
import { analyzeUserResume, getResumeHistory, getResumeAnalysisDetails } from '../controllers/resumeController';
import { protect } from '../middlewares/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.use(protect);

router.post('/analyze', upload.single('resume'), analyzeUserResume);
router.get('/history', getResumeHistory);
router.get('/details/:id', getResumeAnalysisDetails);

export default router;
