import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 연간 비용 추이
router.get('/trend/:year', expenseController.getYearlyTrend);

// 월별 비용 합계
router.get('/monthly/:year/:month', expenseController.getMonthlyTotal);

// 비용 목록
router.get('/', expenseController.getExpenses);

// 비용 상세
router.get('/:id', expenseController.getExpense);

// 비용 등록
router.post('/', expenseController.createExpense);

// 비용 수정
router.put('/:id', expenseController.updateExpense);

// 비용 삭제
router.delete('/:id', expenseController.deleteExpense);

export default router;
