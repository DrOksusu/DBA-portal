import { Router } from 'express';
import * as analyticsService from '../services/analytics.service';
import { verifyInternalToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyInternalToken);

// Get monthly total revenue (used by HR service for incentive calculation)
router.get('/revenue/monthly-total', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const result = await analyticsService.getMonthlyTotal(
      clinicId as string,
      parseInt(year as string),
      parseInt(month as string)
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get monthly total',
    });
  }
});

// Get detailed monthly analytics (internal)
router.get('/revenue/monthly-analytics', async (req, res) => {
  try {
    const { clinicId, year, month } = req.query;

    if (!clinicId || !year || !month) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, year, and month are required',
      });
    }

    const result = await analyticsService.getMonthlyAnalytics(
      clinicId as string,
      parseInt(year as string),
      parseInt(month as string)
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get monthly analytics',
    });
  }
});

export default router;
