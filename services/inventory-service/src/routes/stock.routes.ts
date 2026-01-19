import { Router } from 'express';
import * as stockController from '../controllers/stock.controller';
import { extractUser, requireAuth, requireClinic, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 현재 재고 현황
router.get('/current', stockController.getCurrentStock);

// 입출고 내역
router.get('/movements', stockController.getMovements);

// 입출고 통계
router.get('/stats/:year/:month', stockController.getMovementStats);

// 입출고 기록
router.post('/movements', stockController.recordMovement);

// 재고 실사 목록
router.get('/checks', stockController.getStockChecks);

// 재고 실사 상세
router.get('/checks/:id', stockController.getStockCheck);

// 재고 실사 생성
router.post('/checks', stockController.createStockCheck);

// 재고 실사 반영
router.post('/checks/:id/apply', requireAdmin, stockController.applyStockCheck);

export default router;
