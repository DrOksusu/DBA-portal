import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { extractUser, requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Apply extractUser middleware to all routes
router.use(extractUser);

// Current user routes
router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, userController.updateMe);

// Admin routes
router.get('/pending', requireAuth, requireAdmin, userController.getPendingUsers);
router.post('/:id/approve', requireAuth, requireAdmin, userController.approveUser);
router.post('/:id/reject', requireAuth, requireAdmin, userController.rejectUser);
router.put('/:id/role', requireAuth, requireAdmin, userController.updateUserRole);
router.get('/', requireAuth, requireAdmin, userController.getUsers);

export default router;
