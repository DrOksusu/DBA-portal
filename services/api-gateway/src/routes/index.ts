import { Router } from 'express';
import healthRoutes from './health.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter.middleware';
import {
  authProxy,
  revenueProxy,
  hrProxy,
  inventoryProxy,
  marketingProxy,
  clinicProxy,
} from '../middleware/proxy.middleware';

const router = Router();

// Health check routes (no auth required)
router.use('/health', healthRoutes);

// Auth service routes (special rate limiting for login)
router.use('/api/auth/login', authLimiter);
router.use('/api/auth/register', authLimiter);
router.use('/api/auth', authProxy);

// Apply auth middleware for all other routes
router.use(authMiddleware);

// Apply API rate limiting
router.use(apiLimiter);

// Revenue service routes
router.use('/api/revenue', revenueProxy);

// HR service routes
router.use('/api/hr', hrProxy);

// Inventory service routes
router.use('/api/inventory', inventoryProxy);

// Marketing service routes
router.use('/api/marketing', marketingProxy);

// Clinic service routes
router.use('/api/clinic', clinicProxy);

export default router;
