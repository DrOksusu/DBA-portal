import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as sourceService from '../services/source.service';

const createSourceSchema = z.object({
  patientRef: z.string().optional(),
  visitDate: z.string().transform((str) => new Date(str)),
  channel: z.enum([
    'NAVER_PLACE', 'NAVER_BLOG', 'NAVER_SEARCH', 'GOOGLE_ADS',
    'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'KAKAO',
    'OFFLINE', 'REFERRAL', 'EVENT', 'OTHER'
  ]),
  campaignId: z.string().uuid().optional(),
  referralSource: z.string().optional(),
  treatmentType: z.string().optional(),
  initialRevenue: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateSourceSchema = createSourceSchema.partial().extend({
  totalVisits: z.number().min(1).optional(),
  totalRevenue: z.number().min(0).optional(),
  lastVisitDate: z.string().transform((str) => new Date(str)).optional(),
});

const recordVisitSchema = z.object({
  revenue: z.number().min(0),
});

// 환자 유입 목록 조회
export const getSources = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { channel, campaignId, startDate, endDate, page, limit } = req.query;

    const result = await sourceService.getSources(
      {
        clinicId,
        channel: channel as any,
        campaignId: campaignId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '환자 유입 목록을 불러오는데 실패했습니다',
    });
  }
};

// 환자 유입 상세 조회
export const getSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const source = await sourceService.getSource(clinicId, id);

    if (!source) {
      return res.status(404).json({
        success: false,
        error: '환자 유입 기록을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: source,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '환자 유입 정보를 불러오는데 실패했습니다',
    });
  }
};

// 환자 유입 등록
export const createSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createSourceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const source = await sourceService.createSource({
      clinicId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      data: source,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '환자 유입 등록에 실패했습니다',
    });
  }
};

// 환자 유입 수정
export const updateSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateSourceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const source = await sourceService.updateSource(clinicId, id, validation.data);

    if (!source) {
      return res.status(404).json({
        success: false,
        error: '환자 유입 기록을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: source,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '환자 유입 수정에 실패했습니다',
    });
  }
};

// 재방문 기록
export const recordVisit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = recordVisitSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const source = await sourceService.recordVisit(clinicId, id, validation.data.revenue);

    if (!source) {
      return res.status(404).json({
        success: false,
        error: '환자 유입 기록을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: source,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재방문 기록에 실패했습니다',
    });
  }
};

// 환자 유입 삭제
export const deleteSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const source = await sourceService.deleteSource(clinicId, id);

    if (!source) {
      return res.status(404).json({
        success: false,
        error: '환자 유입 기록을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '환자 유입 기록이 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '환자 유입 삭제에 실패했습니다',
    });
  }
};

// 채널별 유입 통계
export const getSourceStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const stats = await sourceService.getSourceStats(
      clinicId,
      parseInt(year),
      month ? parseInt(month) : undefined
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '유입 통계를 불러오는데 실패했습니다',
    });
  }
};

// 캠페인별 유입 통계
export const getCampaignSourceStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { campaignId } = req.params;

    const stats = await sourceService.getCampaignSourceStats(clinicId, campaignId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 유입 통계를 불러오는데 실패했습니다',
    });
  }
};
