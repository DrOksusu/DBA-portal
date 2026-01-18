import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { extractUser } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh', authController.refresh);

// Token verification (used by API Gateway)
router.get('/verify', authController.verify);
router.post('/verify', authController.verify);

// Protected routes
router.post('/logout', extractUser, authController.logout);

export default router;
