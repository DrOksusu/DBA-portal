import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as policyService from '../services/policy.service';

const policySchema = z.object({
  name: z.string().min(1, '정책 이름은 필수입니다'),
  description: z.string().optional(),
  position: z.enum(['DIRECTOR', 'ASSOCIATE', 'DENTIST', 'HYGIENIST', 'ASSISTANT', 'COORDINATOR', 'DESK', 'MANAGER', 'OTHER']).optional().nullable(),
  calculationType: z.enum(['PERCENTAGE', 'FIXED', 'TIERED']),
  calculationConfig: z.any(),
  minAchievementRate: z.number().min(0).max(200).optional(),
  isActive: z.boolean().optional(),
});

const updatePolicySchema = policySchema.partial();

// 정책 목록 조회
export const getPolicies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { includeInactive } = req.query;

    const policies = await policyService.getPolicies(
      clinicId,
      includeInactive === 'true'
    );

    // JSON 파싱
    const parsedPolicies = policies.map(policy => ({
      ...policy,
      calculationConfig: JSON.parse(policy.calculationConfig),
    }));

    return res.json({
      success: true,
      data: parsedPolicies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '정책 목록을 불러오는데 실패했습니다',
    });
  }
};

// 정책 상세 조회
export const getPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const policy = await policyService.getPolicy(clinicId, id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '정책을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: {
        ...policy,
        calculationConfig: JSON.parse(policy.calculationConfig),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '정책 정보를 불러오는데 실패했습니다',
    });
  }
};

// 정책 생성
export const createPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = policySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const policy = await policyService.createPolicy(clinicId, {
      ...validation.data,
      position: validation.data.position || undefined,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...policy,
        calculationConfig: JSON.parse(policy.calculationConfig),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '정책 생성에 실패했습니다',
    });
  }
};

// 정책 수정
export const updatePolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updatePolicySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const policy = await policyService.updatePolicy(clinicId, id, {
      ...validation.data,
      position: validation.data.position || undefined,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '정책을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: {
        ...policy,
        calculationConfig: JSON.parse(policy.calculationConfig),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '정책 수정에 실패했습니다',
    });
  }
};

// 정책 활성화/비활성화 토글
export const togglePolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const policy = await policyService.togglePolicyActive(clinicId, id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '정책을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: {
        ...policy,
        calculationConfig: JSON.parse(policy.calculationConfig),
      },
      message: policy.isActive ? '정책이 활성화되었습니다' : '정책이 비활성화되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '정책 상태 변경에 실패했습니다',
    });
  }
};

// 정책 삭제
export const deletePolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const policy = await policyService.deletePolicy(clinicId, id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '정책을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '정책이 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '정책 삭제에 실패했습니다',
    });
  }
};

// 기본 정책 생성
export const createDefaultPolicies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;

    const policies = await policyService.createDefaultPolicies(clinicId);

    return res.status(201).json({
      success: true,
      data: policies.map(policy => ({
        ...policy,
        calculationConfig: JSON.parse(policy.calculationConfig),
      })),
      message: `${policies.length}개의 기본 정책이 생성되었습니다`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '기본 정책 생성에 실패했습니다',
    });
  }
};
