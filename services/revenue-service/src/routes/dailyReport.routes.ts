import { Router } from 'express';
import * as dailyReportController from '../controllers/dailyReport.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// Get daily reports
router.get('/', dailyReportController.getDailyReports);

// Create reports
router.post('/income', dailyReportController.createIncome);
router.post('/expense', dailyReportController.createExpense);
router.post('/oral-sales', dailyReportController.createOralSale);

// Update and delete
router.put('/:id', dailyReportController.updateDailyReport);
router.delete('/:id', dailyReportController.deleteDailyReport);

// Summary endpoints
router.get('/daily-closing', dailyReportController.getDailyClosing);
router.get('/revenue-stats', dailyReportController.getRevenueStats);
router.get('/dates', dailyReportController.getInputDates);

export default router;
