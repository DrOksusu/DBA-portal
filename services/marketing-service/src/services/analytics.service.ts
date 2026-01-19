import { prisma } from '../server';
import { MarketingChannel } from '@prisma/client';
import axios from 'axios';

const REVENUE_SERVICE_URL = process.env.REVENUE_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';

// Revenue Service에서 월별 매출 조회
const fetchMonthlyRevenue = async (clinicId: string, year: number, month: number) => {
  try {
    const response = await axios.get(
      `${REVENUE_SERVICE_URL}/api/internal/revenue/monthly-total`,
      {
        params: { clinicId, year, month },
        headers: {
          'x-internal-token': INTERNAL_SERVICE_TOKEN,
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch monthly revenue:', error);
    return null;
  }
};

// 캠페인 성과 기록
export const recordPerformance = async (data: {
  clinicId: string;
  campaignId: string;
  recordDate: Date;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  cost?: number;
  newPatients?: number;
  consultations?: number;
  notes?: string;
}) => {
  const ctr = data.impressions && data.impressions > 0
    ? (data.clicks || 0) / data.impressions * 100
    : null;

  const conversionRate = data.clicks && data.clicks > 0
    ? (data.conversions || 0) / data.clicks * 100
    : null;

  const cpc = data.clicks && data.clicks > 0 && data.cost
    ? data.cost / data.clicks
    : null;

  const cpa = data.conversions && data.conversions > 0 && data.cost
    ? data.cost / data.conversions
    : null;

  return prisma.campaignPerformance.upsert({
    where: {
      campaignId_recordDate: {
        campaignId: data.campaignId,
        recordDate: data.recordDate,
      },
    },
    update: {
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      ctr,
      conversions: data.conversions || 0,
      conversionRate,
      cost: data.cost || 0,
      cpc,
      cpa,
      newPatients: data.newPatients || 0,
      consultations: data.consultations || 0,
      notes: data.notes,
    },
    create: {
      clinicId: data.clinicId,
      campaignId: data.campaignId,
      recordDate: data.recordDate,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      ctr,
      conversions: data.conversions || 0,
      conversionRate,
      cost: data.cost || 0,
      cpc,
      cpa,
      newPatients: data.newPatients || 0,
      consultations: data.consultations || 0,
      notes: data.notes,
    },
  });
};

// 캠페인 성과 조회
export const getCampaignPerformance = async (
  clinicId: string,
  campaignId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const where: any = {
    clinicId,
    campaignId,
  };

  if (startDate || endDate) {
    where.recordDate = {};
    if (startDate) where.recordDate.gte = startDate;
    if (endDate) where.recordDate.lte = endDate;
  }

  const performances = await prisma.campaignPerformance.findMany({
    where,
    orderBy: { recordDate: 'asc' },
  });

  // 합계 계산
  const totals = performances.reduce(
    (acc, p) => ({
      impressions: acc.impressions + p.impressions,
      clicks: acc.clicks + p.clicks,
      conversions: acc.conversions + p.conversions,
      cost: acc.cost + p.cost,
      newPatients: acc.newPatients + p.newPatients,
      consultations: acc.consultations + p.consultations,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0, newPatients: 0, consultations: 0 }
  );

  return {
    performances,
    totals: {
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
      cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
      cpa: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
    },
  };
};

// 월별 마케팅 분석
export const getMonthlyAnalytics = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // 비용 집계
  const expenses = await prisma.marketingExpense.findMany({
    where: {
      clinicId,
      expenseDate: { gte: startDate, lte: endDate },
    },
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseByChannel: Record<string, number> = {};

  for (const expense of expenses) {
    if (expense.channel) {
      expenseByChannel[expense.channel] = (expenseByChannel[expense.channel] || 0) + expense.amount;
    }
  }

  // 신규 환자 집계
  const sources = await prisma.patientSource.findMany({
    where: {
      clinicId,
      visitDate: { gte: startDate, lte: endDate },
    },
  });

  const totalNewPatients = sources.length;
  const newPatientsByChannel: Record<string, number> = {};
  const revenueByChannel: Record<string, number> = {};

  for (const source of sources) {
    newPatientsByChannel[source.channel] = (newPatientsByChannel[source.channel] || 0) + 1;
    revenueByChannel[source.channel] = (revenueByChannel[source.channel] || 0) + source.totalRevenue;
  }

  // 매출 데이터 조회
  const revenueData = await fetchMonthlyRevenue(clinicId, year, month);
  const estimatedRevenue = sources.reduce((sum, s) => sum + s.totalRevenue, 0);

  // ROI 계산
  const roi = totalExpense > 0
    ? ((estimatedRevenue - totalExpense) / totalExpense) * 100
    : 0;

  // 캐시 업데이트
  await prisma.monthlyMarketingAnalytics.upsert({
    where: {
      clinicId_year_month: { clinicId, year, month },
    },
    update: {
      totalExpense,
      expenseByChannel: JSON.stringify(expenseByChannel),
      totalNewPatients,
      newPatientsByChannel: JSON.stringify(newPatientsByChannel),
      estimatedRevenue,
      roi,
      lastCalculatedAt: new Date(),
    },
    create: {
      clinicId,
      year,
      month,
      totalExpense,
      expenseByChannel: JSON.stringify(expenseByChannel),
      totalNewPatients,
      newPatientsByChannel: JSON.stringify(newPatientsByChannel),
      estimatedRevenue,
      roi,
      lastCalculatedAt: new Date(),
    },
  });

  return {
    period: { year, month },
    expense: {
      total: totalExpense,
      byChannel: expenseByChannel,
    },
    newPatients: {
      total: totalNewPatients,
      byChannel: newPatientsByChannel,
    },
    revenue: {
      fromMarketing: estimatedRevenue,
      byChannel: revenueByChannel,
      total: revenueData?.totalIncome || 0,
    },
    roi,
    costPerPatient: totalNewPatients > 0 ? totalExpense / totalNewPatients : 0,
  };
};

// 채널별 성과 분석
export const getChannelAnalytics = async (
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

  // 채널별 비용
  const expenses = await prisma.marketingExpense.groupBy({
    by: ['channel'],
    where: {
      clinicId,
      expenseDate: { gte: startDate, lte: endDate },
      channel: { not: null },
    },
    _sum: { amount: true },
  });

  // 채널별 환자 유입
  const sources = await prisma.patientSource.groupBy({
    by: ['channel'],
    where: {
      clinicId,
      visitDate: { gte: startDate, lte: endDate },
    },
    _count: true,
    _sum: { totalRevenue: true },
  });

  const channelStats: Record<string, {
    expense: number;
    patients: number;
    revenue: number;
    costPerPatient: number;
    roi: number;
  }> = {};

  // 모든 채널 초기화
  const allChannels = Object.values(MarketingChannel);
  for (const channel of allChannels) {
    channelStats[channel] = {
      expense: 0,
      patients: 0,
      revenue: 0,
      costPerPatient: 0,
      roi: 0,
    };
  }

  // 비용 데이터 채우기
  for (const expense of expenses) {
    if (expense.channel) {
      channelStats[expense.channel].expense = expense._sum.amount || 0;
    }
  }

  // 환자/매출 데이터 채우기
  for (const source of sources) {
    channelStats[source.channel].patients = source._count;
    channelStats[source.channel].revenue = source._sum.totalRevenue || 0;
  }

  // 지표 계산
  for (const channel in channelStats) {
    const stats = channelStats[channel];
    stats.costPerPatient = stats.patients > 0 ? stats.expense / stats.patients : 0;
    stats.roi = stats.expense > 0 ? ((stats.revenue - stats.expense) / stats.expense) * 100 : 0;
  }

  return channelStats;
};

// 연간 마케팅 추이
export const getYearlyTrend = async (clinicId: string, year: number) => {
  const monthlyData = [];

  for (let month = 1; month <= 12; month++) {
    const cached = await prisma.monthlyMarketingAnalytics.findFirst({
      where: { clinicId, year, month },
    });

    if (cached) {
      monthlyData.push({
        month,
        totalExpense: cached.totalExpense,
        totalNewPatients: cached.totalNewPatients,
        estimatedRevenue: cached.estimatedRevenue,
        roi: cached.roi,
      });
    } else {
      monthlyData.push({
        month,
        totalExpense: 0,
        totalNewPatients: 0,
        estimatedRevenue: 0,
        roi: 0,
      });
    }
  }

  return monthlyData;
};
