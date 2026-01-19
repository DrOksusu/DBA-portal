import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 제품 통계
router.get('/stats', productController.getProductStats);

// 재고 부족 제품
router.get('/low-stock', productController.getLowStockProducts);

// 제품 목록
router.get('/', productController.getProducts);

// 제품 상세
router.get('/:id', productController.getProduct);

// 제품 등록
router.post('/', productController.createProduct);

// 제품 수정
router.put('/:id', productController.updateProduct);

// 제품 삭제
router.delete('/:id', productController.deleteProduct);

// 공급업체 연결
router.post('/:id/suppliers', productController.linkSupplier);
router.delete('/:id/suppliers/:supplierId', productController.unlinkSupplier);

export default router;
