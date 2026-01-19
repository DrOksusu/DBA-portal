import { Router } from 'express';
import * as sourceController from '../controllers/source.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 채널별 유입 통계 (연간)
router.get('/stats/:year', sourceController.getSourceStats);

// 채널별 유입 통계 (월간)
router.get('/stats/:year/:month', sourceController.getSourceStats);

// 캠페인별 유입 통계
router.get('/campaign/:campaignId/stats', sourceController.getCampaignSourceStats);

// 환자 유입 목록
router.get('/', sourceController.getSources);

// 환자 유입 상세
router.get('/:id', sourceController.getSource);

// 환자 유입 등록
router.post('/', sourceController.createSource);

// 환자 유입 수정
router.put('/:id', sourceController.updateSource);

// 재방문 기록
router.post('/:id/visit', sourceController.recordVisit);

// 환자 유입 삭제
router.delete('/:id', sourceController.deleteSource);

export default router;
