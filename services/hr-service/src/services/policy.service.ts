import { prisma } from '../server';
import { Position } from '@prisma/client';

export interface PolicyData {
  name: string;
  description?: string;
  position?: Position;
  calculationType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  calculationConfig: any;
  minAchievementRate?: number;
  isActive?: boolean;
}

// 인센티브 정책 목록 조회
export const getPolicies = async (clinicId: string, includeInactive = false) => {
  return prisma.incentivePolicy.findMany({
    where: {
      clinicId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [
      { isActive: 'desc' },
      { name: 'asc' },
    ],
  });
};

// 정책 상세 조회
export const getPolicy = async (clinicId: string, policyId: string) => {
  return prisma.incentivePolicy.findFirst({
    where: {
      id: policyId,
      clinicId,
    },
  });
};

// 정책 생성
export const createPolicy = async (clinicId: string, data: PolicyData) => {
  return prisma.incentivePolicy.create({
    data: {
      clinicId,
      name: data.name,
      description: data.description,
      position: data.position,
      calculationType: data.calculationType,
      calculationConfig: JSON.stringify(data.calculationConfig),
      minAchievementRate: data.minAchievementRate,
      isActive: data.isActive ?? true,
    },
  });
};

// 정책 수정
export const updatePolicy = async (
  clinicId: string,
  policyId: string,
  data: Partial<PolicyData>
) => {
  const existing = await prisma.incentivePolicy.findFirst({
    where: { id: policyId, clinicId },
  });

  if (!existing) {
    return null;
  }

  return prisma.incentivePolicy.update({
    where: { id: policyId },
    data: {
      name: data.name,
      description: data.description,
      position: data.position,
      calculationType: data.calculationType,
      calculationConfig: data.calculationConfig
        ? JSON.stringify(data.calculationConfig)
        : undefined,
      minAchievementRate: data.minAchievementRate,
      isActive: data.isActive,
    },
  });
};

// 정책 활성화/비활성화
export const togglePolicyActive = async (clinicId: string, policyId: string) => {
  const existing = await prisma.incentivePolicy.findFirst({
    where: { id: policyId, clinicId },
  });

  if (!existing) {
    return null;
  }

  return prisma.incentivePolicy.update({
    where: { id: policyId },
    data: { isActive: !existing.isActive },
  });
};

// 정책 삭제
export const deletePolicy = async (clinicId: string, policyId: string) => {
  const existing = await prisma.incentivePolicy.findFirst({
    where: { id: policyId, clinicId },
  });

  if (!existing) {
    return null;
  }

  return prisma.incentivePolicy.delete({
    where: { id: policyId },
  });
};

// 기본 정책 템플릿 생성
export const createDefaultPolicies = async (clinicId: string) => {
  const defaultPolicies = [
    {
      name: '전체 직원 매출 인센티브',
      description: '월 매출의 3%를 인센티브로 지급 (목표 달성 시)',
      position: null,
      calculationType: 'PERCENTAGE' as const,
      calculationConfig: { rate: 3 },
      minAchievementRate: 100,
    },
    {
      name: '의사 성과 인센티브',
      description: '목표 달성률에 따른 단계별 인센티브',
      position: 'DENTIST' as Position,
      calculationType: 'TIERED' as const,
      calculationConfig: {
        tiers: [
          { min: 100, max: 120, rate: 3 },
          { min: 120, max: 150, rate: 5 },
          { min: 150, max: null, rate: 7 },
        ],
      },
      minAchievementRate: 100,
    },
    {
      name: '위생사 고정 인센티브',
      description: '목표 달성 시 고정 금액 지급',
      position: 'HYGIENIST' as Position,
      calculationType: 'FIXED' as const,
      calculationConfig: { amount: 200000 },
      minAchievementRate: 100,
    },
  ];

  const results = [];
  for (const policy of defaultPolicies) {
    const created = await createPolicy(clinicId, policy);
    results.push(created);
  }

  return results;
};

// 직위별 적용 정책 조회
export const getPolicyByPosition = async (clinicId: string, position: Position) => {
  // 직위별 정책 우선 조회, 없으면 전체 적용 정책
  const specific = await prisma.incentivePolicy.findFirst({
    where: {
      clinicId,
      position,
      isActive: true,
    },
  });

  if (specific) {
    return specific;
  }

  return prisma.incentivePolicy.findFirst({
    where: {
      clinicId,
      position: null,
      isActive: true,
    },
  });
};
