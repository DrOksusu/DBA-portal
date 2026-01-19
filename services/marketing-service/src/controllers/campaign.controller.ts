import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as campaignService from '../services/campaign.service';

const createCampaignSchema = z.object({
  name: z.string().min(1, '캠페인명은 필수입니다'),
  description: z.string().optional(),
  channel: z.enum([
    'NAVER_PLACE', 'NAVER_BLOG', 'NAVER_SEARCH', 'GOOGLE_ADS',
    'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'KAKAO',
    'OFFLINE', 'REFERRAL', 'EVENT', 'OTHER'
  ]),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  budgetAmount: z.number().min(0).optional(),
  targetMetric: z.string().optional(),
  targetValue: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateCampaignSchema = createCampaignSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
});

// 캠페인 목록 조회
export const getCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { status, channel, startDate, endDate, page, limit } = req.query;

    const result = await campaignService.getCampaigns(
      {
        clinicId,
        status: status as any,
        channel: channel as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 목록을 불러오는데 실패했습니다',
    });
  }
};

// 활성 캠페인 목록
export const getActiveCampaigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;

    const campaigns = await campaignService.getActiveCampaigns(clinicId);

    return res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '활성 캠페인 목록을 불러오는데 실패했습니다',
    });
  }
};

// 캠페인 상세 조회
export const getCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const campaign = await campaignService.getCampaign(clinicId, id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: '캠페인을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 정보를 불러오는데 실패했습니다',
    });
  }
};

// 캠페인 생성
export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const campaign = await campaignService.createCampaign({
      clinicId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 생성에 실패했습니다',
    });
  }
};

// 캠페인 수정
export const updateCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const campaign = await campaignService.updateCampaign(clinicId, id, validation.data);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: '캠페인을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 수정에 실패했습니다',
    });
  }
};

// 캠페인 상태 변경
export const updateStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const campaign = await campaignService.updateCampaignStatus(clinicId, id, validation.data.status);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: '캠페인을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 상태 변경에 실패했습니다',
    });
  }
};

// 캠페인 ROI 계산
export const calculateROI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const campaign = await campaignService.calculateCampaignROI(clinicId, id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: '캠페인을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'ROI 계산에 실패했습니다',
    });
  }
};

// 캠페인 삭제
export const deleteCampaign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const campaign = await campaignService.deleteCampaign(clinicId, id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: '캠페인을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '캠페인이 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '캠페인 삭제에 실패했습니다',
    });
  }
};
