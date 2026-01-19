import { Router } from 'express';
import * as excelController from '../controllers/excel.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// Upload and parse Excel file (preview before import)
router.post('/upload', excelController.upload.single('file'), excelController.uploadAndParse);

// Import parsed data
router.post('/import', excelController.importData);

// Combined upload and import in one step
router.post('/upload-import', excelController.upload.single('file'), excelController.uploadAndImport);

export default router;
