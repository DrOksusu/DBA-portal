import { prisma } from '../server';
import axios from 'axios';

const REVENUE_SERVICE_URL = process.env.REVENUE_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';

export interface TargetData {
  targetAmount: number;
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

// 목표 매출 목록 조회 (연도별)
export const getTargets = async (clinicId: string, year: number) => {
  return prisma.targetRevenue.findMany({
    where: {
      clinicId,
      year,
    },
    orderBy: { month: 'asc' },
  });
};

// 목표 매출 상세 조회
export const getTarget = async (
  clinicId: string,
  year: number,
  month: number | null
) => {
  return prisma.targetRevenue.findFirst({
    where: {
      clinicId,
      year,
      month,
    },
  });
};

// 목표 매출 설정 (upsert)
export const setTarget = async (
  clinicId: string,
  year: number,
  month: number | null,
  data: TargetData
) => {
  // 고유 키 찾기
  const existing = await prisma.targetRevenue.findFirst({
    where: {
      clinicId,
      year,
      month,
    },
  });

  if (existing) {
    return prisma.targetRevenue.update({
      where: { id: existing.id },
      data: {
        targetAmount: data.targetAmount,
        notes: data.notes,
      },
    });
  }

  return prisma.targetRevenue.create({
    data: {
      clinicId,
      year,
      month,
      targetAmount: data.targetAmount,
      notes: data.notes,
    },
  });
};

// 월별 목표 일괄 설정
export const setMonthlyTargets = async (
  clinicId: string,
  year: number,
  targets: { month: number; targetAmount: number; notes?: string }[]
) => {
  const results = [];

  for (const target of targets) {
    const result = await setTarget(clinicId, year, target.month, {
      targetAmount: target.targetAmount,
      notes: target.notes,
    });
    results.push(result);
  }

  return results;
};

// 실적 동기화 (Revenue Service에서 실제 매출 가져와서 업데이트)
export const syncActualRevenue = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const target = await prisma.targetRevenue.findFirst({
    where: {
      clinicId,
      year,
      month,
    },
  });

  if (!target) {
    return null;
  }

  const revenueData = await fetchMonthlyRevenue(clinicId, year, month);
  if (!revenueData) {
    return null;
  }

  const actualAmount = revenueData.totalIncome || 0;
  const achievementRate = target.targetAmount > 0
    ? (actualAmount / target.targetAmount) * 100
    : 0;

  return prisma.targetRevenue.update({
    where: { id: target.id },
    data: {
      actualAmount,
      achievementRate,
      lastSyncedAt: new Date(),
    },
  });
};

// 연간 목표 달성 현황 조회
export const getYearlyProgress = async (clinicId: string, year: number) => {
  const targets = await prisma.targetRevenue.findMany({
    where: {
      clinicId,
      year,
      month: { not: null },
    },
    orderBy: { month: 'asc' },
  });

  // 연간 목표
  const yearlyTarget = await prisma.targetRevenue.findFirst({
    where: {
      clinicId,
      year,
      month: null,
    },
  });

  // 각 월 실적 동기화 및 합계 계산
  let totalTarget = 0;
  let totalActual = 0;

  const monthlyProgress = [];

  for (const target of targets) {
    // 실적 데이터가 오래된 경우 동기화
    const shouldSync = !target.lastSyncedAt ||
      (new Date().getTime() - target.lastSyncedAt.getTime()) > 60 * 60 * 1000; // 1시간

    let updatedTarget = target;
    if (shouldSync && target.month) {
      const synced = await syncActualRevenue(clinicId, year, target.month);
      if (synced) {
        updatedTarget = synced;
      }
    }

    totalTarget += updatedTarget.targetAmount;
    totalActual += updatedTarget.actualAmount || 0;

    monthlyProgress.push({
      month: updatedTarget.month,
      targetAmount: updatedTarget.targetAmount,
      actualAmount: updatedTarget.actualAmount || 0,
      achievementRate: updatedTarget.achievementRate || 0,
      lastSyncedAt: updatedTarget.lastSyncedAt,
    });
  }

  return {
    year,
    yearlyTarget: yearlyTarget?.targetAmount || totalTarget,
    monthlyTotal: {
      target: totalTarget,
      actual: totalActual,
      achievementRate: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
    },
    monthlyProgress,
  };
};

// 목표 대비 실적 비교
export const getTargetVsActual = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const target = await prisma.targetRevenue.findFirst({
    where: {
      clinicId,
      year,
      month,
    },
  });

  // 실적 동기화
  const synced = await syncActualRevenue(clinicId, year, month);
  const latest = synced || target;

  if (!latest) {
    return null;
  }

  const gap = (latest.actualAmount || 0) - latest.targetAmount;
  const isAchieved = gap >= 0;

  return {
    targetAmount: latest.targetAmount,
    actualAmount: latest.actualAmount || 0,
    achievementRate: latest.achievementRate || 0,
    gap,
    isAchieved,
    lastSyncedAt: latest.lastSyncedAt,
  };
};

// 목표 삭제
export const deleteTarget = async (clinicId: string, targetId: string) => {
  const target = await prisma.targetRevenue.findFirst({
    where: {
      id: targetId,
      clinicId,
    },
  });

  if (!target) {
    return null;
  }

  return prisma.targetRevenue.delete({
    where: { id: targetId },
  });
};
