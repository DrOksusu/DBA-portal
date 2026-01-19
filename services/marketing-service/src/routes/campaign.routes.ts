import { Router } from 'express';
import * as campaignController from '../controllers/campaign.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 활성 캠페인 목록
router.get('/active', campaignController.getActiveCampaigns);

// 캠페인 목록
router.get('/', campaignController.getCampaigns);

// 캠페인 상세
router.get('/:id', campaignController.getCampaign);

// 캠페인 생성
router.post('/', campaignController.createCampaign);

// 캠페인 수정
router.put('/:id', campaignController.updateCampaign);

// 캠페인 상태 변경
router.patch('/:id/status', campaignController.updateStatus);

// 캠페인 ROI 계산
router.post('/:id/calculate-roi', campaignController.calculateROI);

// 캠페인 삭제
router.delete('/:id', campaignController.deleteCampaign);

export default router;
