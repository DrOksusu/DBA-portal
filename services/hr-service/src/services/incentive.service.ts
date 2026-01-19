import { prisma } from '../server';
import { IncentiveType, Prisma } from '@prisma/client';
import axios from 'axios';

const REVENUE_SERVICE_URL = process.env.REVENUE_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';

export interface CreateIncentiveData {
  clinicId: string;
  employeeId: string;
  year: number;
  month: number;
  type: IncentiveType;
  revenueAmount?: number;
  targetAmount?: number;
  calculatedAmount: number;
  adjustedAmount?: number;
  notes?: string;
}

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

// 인센티브 목록 조회
export const getIncentives = async (
  clinicId: string,
  year: number,
  month: number,
  page = 1,
  limit = 50
) => {
  const [incentives, total] = await Promise.all([
    prisma.incentive.findMany({
      where: {
        clinicId,
        year,
        month,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        employee: { name: 'asc' },
      },
    }),
    prisma.incentive.count({
      where: { clinicId, year, month },
    }),
  ]);

  return {
    incentives,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 직원별 인센티브 이력 조회
export const getEmployeeIncentiveHistory = async (
  clinicId: string,
  employeeId: string,
  limit = 12
) => {
  return prisma.incentive.findMany({
    where: {
      clinicId,
      employeeId,
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
    take: limit,
  });
};

// 인센티브 상세 조회
export const getIncentive = async (clinicId: string, incentiveId: string) => {
  return prisma.incentive.findFirst({
    where: {
      id: incentiveId,
      clinicId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
        },
      },
    },
  });
};

// 인센티브 생성
export const createIncentive = async (data: CreateIncentiveData) => {
  const achievementRate = data.targetAmount && data.targetAmount > 0
    ? (data.revenueAmount || 0) / data.targetAmount * 100
    : null;

  return prisma.incentive.create({
    data: {
      clinicId: data.clinicId,
      employeeId: data.employeeId,
      year: data.year,
      month: data.month,
      type: data.type,
      revenueAmount: data.revenueAmount,
      targetAmount: data.targetAmount,
      achievementRate,
      calculatedAmount: data.calculatedAmount,
      adjustedAmount: data.adjustedAmount,
      finalAmount: data.adjustedAmount ?? data.calculatedAmount,
      notes: data.notes,
    },
  });
};

// 인센티브 수정
export const updateIncentive = async (
  clinicId: string,
  incentiveId: string,
  data: Partial<CreateIncentiveData>
) => {
  const existing = await prisma.incentive.findFirst({
    where: { id: incentiveId, clinicId },
  });

  if (!existing) {
    return null;
  }

  const achievementRate = data.targetAmount && data.targetAmount > 0
    ? (data.revenueAmount || existing.revenueAmount || 0) / data.targetAmount * 100
    : existing.achievementRate;

  const finalAmount = data.adjustedAmount ?? data.calculatedAmount ?? existing.finalAmount;

  return prisma.incentive.update({
    where: { id: incentiveId },
    data: {
      ...data,
      achievementRate,
      finalAmount,
    },
  });
};

// 매출 기반 인센티브 자동 계산
export const calculateRevenueBasedIncentives = async (
  clinicId: string,
  year: number,
  month: number
) => {
  // 1. Revenue Service에서 월 매출 조회
  const revenueData = await fetchMonthlyRevenue(clinicId, year, month);
  if (!revenueData) {
    throw new Error('매출 데이터를 조회할 수 없습니다');
  }

  // 2. 해당 월 목표 매출 조회
  const target = await prisma.targetRevenue.findFirst({
    where: {
      clinicId,
      year,
      month,
    },
  });

  // 3. 인센티브 정책 조회
  const policies = await prisma.incentivePolicy.findMany({
    where: {
      clinicId,
      isActive: true,
    },
  });

  // 4. 재직 중인 직원 목록
  const employees = await prisma.employee.findMany({
    where: {
      clinicId,
      status: 'ACTIVE',
    },
  });

  const results = [];
  const totalRevenue = revenueData.totalIncome || 0;
  const targetAmount = target?.targetAmount || 0;
  const achievementRate = targetAmount > 0 ? (totalRevenue / targetAmount) * 100 : 0;

  for (const employee of employees) {
    // 직원에게 적용할 정책 찾기
    const applicablePolicy = policies.find(
      p => p.position === employee.position || p.position === null
    );

    if (!applicablePolicy) continue;

    // 최소 달성률 미달 시 스킵
    if (applicablePolicy.minAchievementRate && achievementRate < applicablePolicy.minAchievementRate) {
      continue;
    }

    // 인센티브 금액 계산
    let calculatedAmount = 0;
    const config = JSON.parse(applicablePolicy.calculationConfig);

    switch (applicablePolicy.calculationType) {
      case 'PERCENTAGE':
        calculatedAmount = Math.round(totalRevenue * (config.rate / 100));
        break;

      case 'FIXED':
        calculatedAmount = config.amount;
        break;

      case 'TIERED':
        for (const tier of config.tiers) {
          if (achievementRate >= tier.min && (tier.max === null || achievementRate < tier.max)) {
            calculatedAmount = Math.round(totalRevenue * (tier.rate / 100));
            break;
          }
        }
        break;
    }

    // 기존 인센티브 확인 (중복 방지)
    const existing = await prisma.incentive.findFirst({
      where: {
        employeeId: employee.id,
        year,
        month,
        type: 'REVENUE_BASED',
      },
    });

    if (existing) {
      // 기존 인센티브 업데이트
      const updated = await prisma.incentive.update({
        where: { id: existing.id },
        data: {
          revenueAmount: totalRevenue,
          targetAmount,
          achievementRate,
          calculatedAmount,
          finalAmount: existing.adjustedAmount ?? calculatedAmount,
        },
      });
      results.push(updated);
    } else {
      // 새 인센티브 생성
      const created = await prisma.incentive.create({
        data: {
          clinicId,
          employeeId: employee.id,
          year,
          month,
          type: 'REVENUE_BASED',
          revenueAmount: totalRevenue,
          targetAmount,
          achievementRate,
          calculatedAmount,
          finalAmount: calculatedAmount,
        },
      });
      results.push(created);
    }
  }

  return results;
};

// 인센티브 지급 처리
export const markAsPaid = async (
  clinicId: string,
  incentiveIds: string[],
  paidDate: Date
) => {
  return prisma.incentive.updateMany({
    where: {
      id: { in: incentiveIds },
      clinicId,
    },
    data: {
      isPaid: true,
      paidDate,
    },
  });
};

// 월 인센티브 통계
export const getMonthlyIncentiveSummary = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const incentives = await prisma.incentive.findMany({
    where: {
      clinicId,
      year,
      month,
    },
    include: {
      employee: {
        select: {
          position: true,
        },
      },
    },
  });

  const summary = {
    totalCount: incentives.length,
    totalCalculated: 0,
    totalAdjusted: 0,
    totalFinal: 0,
    paidCount: 0,
    unpaidCount: 0,
    byType: {} as Record<string, { count: number; total: number }>,
    byPosition: {} as Record<string, { count: number; total: number }>,
  };

  for (const incentive of incentives) {
    summary.totalCalculated += incentive.calculatedAmount;
    summary.totalAdjusted += incentive.adjustedAmount || 0;
    summary.totalFinal += incentive.finalAmount;

    if (incentive.isPaid) {
      summary.paidCount++;
    } else {
      summary.unpaidCount++;
    }

    // By type
    if (!summary.byType[incentive.type]) {
      summary.byType[incentive.type] = { count: 0, total: 0 };
    }
    summary.byType[incentive.type].count++;
    summary.byType[incentive.type].total += incentive.finalAmount;

    // By position
    const position = incentive.employee.position;
    if (!summary.byPosition[position]) {
      summary.byPosition[position] = { count: 0, total: 0 };
    }
    summary.byPosition[position].count++;
    summary.byPosition[position].total += incentive.finalAmount;
  }

  return summary;
};

// 인센티브 삭제
export const deleteIncentive = async (clinicId: string, incentiveId: string) => {
  const incentive = await prisma.incentive.findFirst({
    where: {
      id: incentiveId,
      clinicId,
    },
  });

  if (!incentive) {
    return null;
  }

  return prisma.incentive.delete({
    where: { id: incentiveId },
  });
};
