import { Router } from 'express';
import * as policyController from '../controllers/policy.controller';
import { extractUser, requireAuth, requireClinic, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 정책 목록
router.get('/', policyController.getPolicies);

// 기본 정책 생성
router.post('/defaults', requireAdmin, policyController.createDefaultPolicies);

// 정책 상세
router.get('/:id', policyController.getPolicy);

// 정책 생성
router.post('/', requireAdmin, policyController.createPolicy);

// 정책 수정
router.put('/:id', requireAdmin, policyController.updatePolicy);

// 정책 활성화/비활성화
router.post('/:id/toggle', requireAdmin, policyController.togglePolicy);

// 정책 삭제
router.delete('/:id', requireAdmin, policyController.deletePolicy);

export default router;
