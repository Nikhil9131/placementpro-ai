import { Router } from 'express';
import { getCompanyRoadmaps, getCompanyRoadmapDetails } from '../controllers/roadmapController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/', getCompanyRoadmaps);
router.get('/:companyName', getCompanyRoadmapDetails);

export default router;
