import { Router } from 'express';
import * as incentiveController from '../controllers/incentive.controller';
import { extractUser, requireAuth, requireClinic, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 월별 인센티브 목록
router.get('/monthly/:year/:month', incentiveController.getMonthlyIncentives);

// 월 인센티브 통계
router.get('/summary/:year/:month', incentiveController.getMonthlySummary);

// 매출 기반 인센티브 자동 계산
router.post('/calculate/:year/:month', requireAdmin, incentiveController.calculateRevenueBasedIncentives);

// 인센티브 지급 처리
router.post('/mark-paid', requireAdmin, incentiveController.markAsPaid);

// 직원별 인센티브 이력
router.get('/employee/:employeeId', incentiveController.getEmployeeIncentiveHistory);

// 인센티브 상세
router.get('/:id', incentiveController.getIncentive);

// 인센티브 생성
router.post('/', incentiveController.createIncentive);

// 인센티브 수정
router.put('/:id', incentiveController.updateIncentive);

// 인센티브 삭제
router.delete('/:id', requireAdmin, incentiveController.deleteIncentive);

export default router;
