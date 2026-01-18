import { Router } from 'express';
import * as clinicController from '../controllers/clinic.controller';
import { extractUser, requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);

// Get all clinics (Admin only)
router.get('/', requireAuth, requireAdmin, clinicController.getAllClinics);

// Create clinic (Admin only)
router.post('/', requireAuth, requireAdmin, clinicController.createClinic);

// Get specific clinic
router.get('/:id', requireAuth, clinicController.getClinic);

// Update clinic
router.put('/:id', requireAuth, clinicController.updateClinic);

// Upload logo
router.post('/:id/logo', requireAuth, clinicController.uploadLogo);

export default router;
