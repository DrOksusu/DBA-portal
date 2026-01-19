import { Router } from 'express';
import * as salaryController from '../controllers/salary.controller';
import { extractUser, requireAuth, requireClinic, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 연간 급여 추이
router.get('/trend/:year', salaryController.getYearlyTrend);

// 월별 급여 목록
router.get('/monthly/:year/:month', salaryController.getMonthlySalaries);

// 월 급여 통계
router.get('/summary/:year/:month', salaryController.getMonthlySummary);

// 월 급여 일괄 생성
router.post('/generate/:year/:month', requireAdmin, salaryController.generateMonthlySalaries);

// 급여 지급 처리
router.post('/mark-paid', requireAdmin, salaryController.markAsPaid);

// 직원별 급여 이력
router.get('/employee/:employeeId', salaryController.getEmployeeSalaryHistory);

// 급여 상세
router.get('/:id', salaryController.getSalary);

// 급여 생성/수정
router.put('/employee/:employeeId/:year/:month', salaryController.upsertSalary);

// 급여 삭제
router.delete('/:id', requireAdmin, salaryController.deleteSalary);

export default router;
