import { prisma } from '../server';
import { MarketingChannel, CampaignStatus, Prisma } from '@prisma/client';

export interface CreateCampaignData {
  clinicId: string;
  name: string;
  description?: string;
  channel: MarketingChannel;
  startDate: Date;
  endDate?: Date;
  budgetAmount?: number;
  targetMetric?: string;
  targetValue?: number;
  notes?: string;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  channel?: MarketingChannel;
  status?: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  budgetAmount?: number;
  targetMetric?: string;
  targetValue?: number;
  notes?: string;
}

export interface CampaignFilter {
  clinicId: string;
  status?: CampaignStatus;
  channel?: MarketingChannel;
  startDate?: Date;
  endDate?: Date;
}

// 캠페인 목록 조회
export const getCampaigns = async (filter: CampaignFilter, page = 1, limit = 20) => {
  const where: Prisma.CampaignWhereInput = {
    clinicId: filter.clinicId,
  };

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.channel) {
    where.channel = filter.channel;
  }

  if (filter.startDate || filter.endDate) {
    where.startDate = {};
    if (filter.startDate) {
      where.startDate.gte = filter.startDate;
    }
    if (filter.endDate) {
      where.startDate.lte = filter.endDate;
    }
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: {
            expenses: true,
            performances: true,
          },
        },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  return {
    campaigns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 캠페인 상세 조회
export const getCampaign = async (clinicId: string, campaignId: string) => {
  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      clinicId,
    },
    include: {
      expenses: {
        orderBy: { expenseDate: 'desc' },
        take: 10,
      },
      performances: {
        orderBy: { recordDate: 'desc' },
        take: 30,
      },
    },
  });
};

// 캠페인 생성
export const createCampaign = async (data: CreateCampaignData) => {
  return prisma.campaign.create({
    data: {
      clinicId: data.clinicId,
      name: data.name,
      description: data.description,
      channel: data.channel,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetAmount: data.budgetAmount || 0,
      targetMetric: data.targetMetric,
      targetValue: data.targetValue,
      notes: data.notes,
    },
  });
};

// 캠페인 수정
export const updateCampaign = async (
  clinicId: string,
  campaignId: string,
  data: UpdateCampaignData
) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, clinicId },
  });

  if (!campaign) {
    return null;
  }

  return prisma.campaign.update({
    where: { id: campaignId },
    data,
  });
};

// 캠페인 상태 변경
export const updateCampaignStatus = async (
  clinicId: string,
  campaignId: string,
  status: CampaignStatus
) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, clinicId },
  });

  if (!campaign) {
    return null;
  }

  return prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
  });
};

// 캠페인 삭제
export const deleteCampaign = async (clinicId: string, campaignId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, clinicId },
  });

  if (!campaign) {
    return null;
  }

  return prisma.campaign.delete({
    where: { id: campaignId },
  });
};

// 캠페인 지출액 업데이트
export const updateCampaignSpent = async (campaignId: string) => {
  const expenses = await prisma.marketingExpense.aggregate({
    where: { campaignId },
    _sum: { amount: true },
  });

  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      spentAmount: expenses._sum.amount || 0,
    },
  });
};

// 캠페인 ROI 계산
export const calculateCampaignROI = async (clinicId: string, campaignId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, clinicId },
  });

  if (!campaign) {
    return null;
  }

  // 캠페인 관련 환자 유입에서 매출 합계
  const sources = await prisma.patientSource.aggregate({
    where: {
      clinicId,
      campaignId,
    },
    _sum: { totalRevenue: true },
  });

  const totalRevenue = sources._sum.totalRevenue || 0;
  const spentAmount = campaign.spentAmount;

  const roi = spentAmount > 0
    ? ((totalRevenue - spentAmount) / spentAmount) * 100
    : 0;

  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      achievedValue: totalRevenue,
      roi,
    },
  });
};

// 활성 캠페인 목록
export const getActiveCampaigns = async (clinicId: string) => {
  return prisma.campaign.findMany({
    where: {
      clinicId,
      status: 'ACTIVE',
    },
    orderBy: { startDate: 'desc' },
  });
};
