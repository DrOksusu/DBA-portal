import { Router } from 'express';
import * as targetController from '../controllers/target.controller';
import { extractUser, requireAuth, requireClinic, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 연도별 목표 목록
router.get('/:year', targetController.getTargets);

// 연간 목표 달성 현황
router.get('/:year/progress', targetController.getYearlyProgress);

// 월별 목표 상세
router.get('/:year/:month', targetController.getTarget);

// 목표 대비 실적 비교
router.get('/:year/:month/comparison', targetController.getTargetVsActual);

// 실적 동기화
router.post('/:year/:month/sync', targetController.syncActual);

// 목표 설정
router.put('/:year/:month', requireAdmin, targetController.setTarget);

// 연간 목표 설정
router.put('/:year', requireAdmin, targetController.setTarget);

// 월별 목표 일괄 설정
router.post('/:year/batch', requireAdmin, targetController.setMonthlyTargets);

// 목표 삭제
router.delete('/:id', requireAdmin, targetController.deleteTarget);

export default router;
