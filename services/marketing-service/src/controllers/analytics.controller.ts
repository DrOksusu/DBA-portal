import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as analyticsService from '../services/analytics.service';

const performanceSchema = z.object({
  campaignId: z.string().uuid(),
  recordDate: z.string().transform((str) => new Date(str)),
  impressions: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  conversions: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  newPatients: z.number().min(0).optional(),
  consultations: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// 캠페인 성과 기록
export const recordPerformance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = performanceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const performance = await analyticsService.recordPerformance({
      clinicId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '성과 기록에 실패했습니다',
    });
  }
};

// 캠페인 성과 조회
export const getCampaignPerformance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { campaignId } = req.params;
    const { startDate, endDate } = req.query;

    const performance = await analyticsService.getCampaignPerformance(
      clinicId,
      campaignId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    return res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 성과를 불러오는데 실패했습니다',
    });
  }
};

// 월별 마케팅 분석
export const getMonthlyAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const analytics = await analyticsService.getMonthlyAnalytics(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '월별 분석을 불러오는데 실패했습니다',
    });
  }
};

// 채널별 성과 분석
export const getChannelAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const analytics = await analyticsService.getChannelAnalytics(
      clinicId,
      parseInt(year),
      month ? parseInt(month) : undefined
    );

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '채널별 분석을 불러오는데 실패했습니다',
    });
  }
};

// 연간 마케팅 추이
export const getYearlyTrend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year } = req.params;

    const trend = await analyticsService.getYearlyTrend(clinicId, parseInt(year));

    return res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '연간 추이를 불러오는데 실패했습니다',
    });
  }
};
