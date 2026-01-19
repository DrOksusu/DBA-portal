import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 공급업체 목록
router.get('/', supplierController.getSuppliers);

// 공급업체 상세
router.get('/:id', supplierController.getSupplier);

// 공급업체별 제품 목록
router.get('/:id/products', supplierController.getSupplierProducts);

// 공급업체 등록
router.post('/', supplierController.createSupplier);

// 공급업체 수정
router.put('/:id', supplierController.updateSupplier);

// 공급업체 삭제
router.delete('/:id', supplierController.deleteSupplier);

export default router;
