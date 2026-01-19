import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// Monthly analytics
router.get('/monthly/:year/:month', analyticsController.getMonthlyAnalytics);

// Yearly analytics
router.get('/yearly/:year', analyticsController.getYearlyAnalytics);

// Refresh cache
router.post('/cache/refresh', analyticsController.refreshCache);

export default router;
