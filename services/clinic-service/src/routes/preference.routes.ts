import { Router } from 'express';
import * as preferenceController from '../controllers/preference.controller';
import { extractUser, requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);

// Get all preferences
router.get('/', preferenceController.getAllPreferences);

// Get specific preference
router.get('/:key', preferenceController.getPreference);

// Set preference
router.post('/:key', preferenceController.setPreference);

// Delete preference
router.delete('/:key', preferenceController.deletePreference);

export default router;
