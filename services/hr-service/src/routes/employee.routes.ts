import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// 직원 통계
router.get('/stats', employeeController.getEmployeeStats);

// 직원 목록
router.get('/', employeeController.getEmployees);

// 직원 상세
router.get('/:id', employeeController.getEmployee);

// 직원 등록
router.post('/', employeeController.createEmployee);

// 직원 수정
router.put('/:id', employeeController.updateEmployee);

// 퇴사 처리
router.post('/:id/resign', employeeController.resignEmployee);

// 재직 복귀
router.post('/:id/reinstate', employeeController.reinstateEmployee);

// 직원 삭제
router.delete('/:id', employeeController.deleteEmployee);

export default router;
