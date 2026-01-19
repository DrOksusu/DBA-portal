import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

export async function getMonthlyAnalytics(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { year, month } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year or month',
      });
    }

    const analytics = await analyticsService.getMonthlyAnalytics(clinicId, yearNum, monthNum);

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get monthly analytics',
    });
  }
}

export async function getYearlyAnalytics(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { year } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const yearNum = parseInt(year);

    if (isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year',
      });
    }

    const analytics = await analyticsService.getYearlyAnalytics(clinicId, yearNum);

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get yearly analytics',
    });
  }
}

export async function refreshCache(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { year, month } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const yearNum = parseInt(year) || new Date().getFullYear();
    const monthNum = parseInt(month) || new Date().getMonth() + 1;

    const analytics = await analyticsService.refreshCache(clinicId, yearNum, monthNum);

    return res.json({
      success: true,
      message: 'Cache refreshed successfully',
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to refresh cache',
    });
  }
}
