import { prisma } from '../server';
import { MarketingChannel, Prisma } from '@prisma/client';

export interface CreateSourceData {
  clinicId: string;
  patientRef?: string;
  visitDate: Date;
  channel: MarketingChannel;
  campaignId?: string;
  referralSource?: string;
  treatmentType?: string;
  initialRevenue?: number;
  notes?: string;
}

export interface UpdateSourceData {
  channel?: MarketingChannel;
  campaignId?: string;
  referralSource?: string;
  treatmentType?: string;
  totalVisits?: number;
  totalRevenue?: number;
  lastVisitDate?: Date;
  notes?: string;
}

export interface SourceFilter {
  clinicId: string;
  channel?: MarketingChannel;
  campaignId?: string;
  startDate?: Date;
  endDate?: Date;
}

// 환자 유입 기록 목록 조회
export const getSources = async (filter: SourceFilter, page = 1, limit = 50) => {
  const where: Prisma.PatientSourceWhereInput = {
    clinicId: filter.clinicId,
  };

  if (filter.channel) {
    where.channel = filter.channel;
  }

  if (filter.campaignId) {
    where.campaignId = filter.campaignId;
  }

  if (filter.startDate || filter.endDate) {
    where.visitDate = {};
    if (filter.startDate) {
      where.visitDate.gte = filter.startDate;
    }
    if (filter.endDate) {
      where.visitDate.lte = filter.endDate;
    }
  }

  const [sources, total] = await Promise.all([
    prisma.patientSource.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { visitDate: 'desc' },
    }),
    prisma.patientSource.count({ where }),
  ]);

  return {
    sources,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 환자 유입 기록 상세 조회
export const getSource = async (clinicId: string, sourceId: string) => {
  return prisma.patientSource.findFirst({
    where: {
      id: sourceId,
      clinicId,
    },
  });
};

// 환자 유입 기록 생성
export const createSource = async (data: CreateSourceData) => {
  return prisma.patientSource.create({
    data: {
      clinicId: data.clinicId,
      patientRef: data.patientRef,
      visitDate: data.visitDate,
      channel: data.channel,
      campaignId: data.campaignId,
      referralSource: data.referralSource,
      treatmentType: data.treatmentType,
      initialRevenue: data.initialRevenue || 0,
      totalRevenue: data.initialRevenue || 0,
      notes: data.notes,
    },
  });
};

// 환자 유입 기록 수정
export const updateSource = async (
  clinicId: string,
  sourceId: string,
  data: UpdateSourceData
) => {
  const existing = await prisma.patientSource.findFirst({
    where: { id: sourceId, clinicId },
  });

  if (!existing) {
    return null;
  }

  return prisma.patientSource.update({
    where: { id: sourceId },
    data,
  });
};

// 환자 방문/매출 업데이트 (재방문 기록)
export const recordVisit = async (
  clinicId: string,
  sourceId: string,
  revenue: number
) => {
  const existing = await prisma.patientSource.findFirst({
    where: { id: sourceId, clinicId },
  });

  if (!existing) {
    return null;
  }

  return prisma.patientSource.update({
    where: { id: sourceId },
    data: {
      totalVisits: existing.totalVisits + 1,
      totalRevenue: existing.totalRevenue + revenue,
      lastVisitDate: new Date(),
    },
  });
};

// 환자 유입 기록 삭제
export const deleteSource = async (clinicId: string, sourceId: string) => {
  const existing = await prisma.patientSource.findFirst({
    where: { id: sourceId, clinicId },
  });

  if (!existing) {
    return null;
  }

  return prisma.patientSource.delete({
    where: { id: sourceId },
  });
};

// 채널별 유입 통계
export const getSourceStats = async (
  clinicId: string,
  year: number,
  month?: number
) => {
  const startDate = month
    ? new Date(year, month - 1, 1)
    : new Date(year, 0, 1);
  const endDate = month
    ? new Date(year, month, 0, 23, 59, 59)
    : new Date(year, 11, 31, 23, 59, 59);

  const sources = await prisma.patientSource.findMany({
    where: {
      clinicId,
      visitDate: { gte: startDate, lte: endDate },
    },
  });

  const stats = {
    totalPatients: sources.length,
    totalRevenue: 0,
    byChannel: {} as Record<string, { count: number; revenue: number; avgRevenue: number }>,
  };

  for (const source of sources) {
    stats.totalRevenue += source.totalRevenue;

    if (!stats.byChannel[source.channel]) {
      stats.byChannel[source.channel] = { count: 0, revenue: 0, avgRevenue: 0 };
    }
    stats.byChannel[source.channel].count++;
    stats.byChannel[source.channel].revenue += source.totalRevenue;
  }

  // 평균 계산
  for (const channel in stats.byChannel) {
    const channelStats = stats.byChannel[channel];
    channelStats.avgRevenue = channelStats.count > 0
      ? channelStats.revenue / channelStats.count
      : 0;
  }

  return stats;
};

// 캠페인별 유입 통계
export const getCampaignSourceStats = async (clinicId: string, campaignId: string) => {
  const sources = await prisma.patientSource.findMany({
    where: {
      clinicId,
      campaignId,
    },
  });

  return {
    totalPatients: sources.length,
    totalRevenue: sources.reduce((sum, s) => sum + s.totalRevenue, 0),
    totalVisits: sources.reduce((sum, s) => sum + s.totalVisits, 0),
    avgRevenuePerPatient: sources.length > 0
      ? sources.reduce((sum, s) => sum + s.totalRevenue, 0) / sources.length
      : 0,
  };
};
