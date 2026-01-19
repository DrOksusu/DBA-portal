import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 연간 마케팅 추이
router.get('/trend/:year', analyticsController.getYearlyTrend);

// 월별 마케팅 분석
router.get('/monthly/:year/:month', analyticsController.getMonthlyAnalytics);

// 채널별 성과 분석 (연간)
router.get('/channel/:year', analyticsController.getChannelAnalytics);

// 채널별 성과 분석 (월간)
router.get('/channel/:year/:month', analyticsController.getChannelAnalytics);

// 캠페인 성과 조회
router.get('/campaign/:campaignId', analyticsController.getCampaignPerformance);

// 캠페인 성과 기록
router.post('/performance', analyticsController.recordPerformance);

export default router;
