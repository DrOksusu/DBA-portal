import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as incentiveService from '../services/incentive.service';

const createIncentiveSchema = z.object({
  employeeId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  type: z.enum(['REVENUE_BASED', 'PERFORMANCE_BASED', 'BONUS', 'HOLIDAY', 'OTHER']),
  revenueAmount: z.number().min(0).optional(),
  targetAmount: z.number().min(0).optional(),
  calculatedAmount: z.number().min(0),
  adjustedAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateIncentiveSchema = z.object({
  revenueAmount: z.number().min(0).optional(),
  targetAmount: z.number().min(0).optional(),
  calculatedAmount: z.number().min(0).optional(),
  adjustedAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const markPaidSchema = z.object({
  incentiveIds: z.array(z.string().uuid()),
  paidDate: z.string().transform((str) => new Date(str)),
});

// 월별 인센티브 목록 조회
export const getMonthlyIncentives = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;
    const { page, limit } = req.query;

    const result = await incentiveService.getIncentives(
      clinicId,
      parseInt(year),
      parseInt(month),
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
      error: '인센티브 목록을 불러오는데 실패했습니다',
    });
  }
};

// 직원별 인센티브 이력 조회
export const getEmployeeIncentiveHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { employeeId } = req.params;
    const { limit } = req.query;

    const incentives = await incentiveService.getEmployeeIncentiveHistory(
      clinicId,
      employeeId,
      limit ? parseInt(limit as string) : 12
    );

    return res.json({
      success: true,
      data: incentives,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 이력을 불러오는데 실패했습니다',
    });
  }
};

// 인센티브 상세 조회
export const getIncentive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const incentive = await incentiveService.getIncentive(clinicId, id);

    if (!incentive) {
      return res.status(404).json({
        success: false,
        error: '인센티브 정보를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: incentive,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 정보를 불러오는데 실패했습니다',
    });
  }
};

// 인센티브 생성
export const createIncentive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createIncentiveSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const incentive = await incentiveService.createIncentive({
      clinicId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      data: incentive,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 생성에 실패했습니다',
    });
  }
};

// 인센티브 수정
export const updateIncentive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateIncentiveSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const incentive = await incentiveService.updateIncentive(clinicId, id, validation.data);

    if (!incentive) {
      return res.status(404).json({
        success: false,
        error: '인센티브 정보를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: incentive,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 수정에 실패했습니다',
    });
  }
};

// 매출 기반 인센티브 자동 계산
export const calculateRevenueBasedIncentives = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const incentives = await incentiveService.calculateRevenueBasedIncentives(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    return res.json({
      success: true,
      data: incentives,
      message: `${incentives.length}명의 인센티브가 계산되었습니다`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || '인센티브 계산에 실패했습니다',
    });
  }
};

// 인센티브 지급 처리
export const markAsPaid = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = markPaidSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const result = await incentiveService.markAsPaid(
      clinicId,
      validation.data.incentiveIds,
      validation.data.paidDate
    );

    return res.json({
      success: true,
      data: { updatedCount: result.count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 지급 처리에 실패했습니다',
    });
  }
};

// 월 인센티브 통계
export const getMonthlySummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const summary = await incentiveService.getMonthlyIncentiveSummary(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 통계를 불러오는데 실패했습니다',
    });
  }
};

// 인센티브 삭제
export const deleteIncentive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const incentive = await incentiveService.deleteIncentive(clinicId, id);

    if (!incentive) {
      return res.status(404).json({
        success: false,
        error: '인센티브 정보를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '인센티브 정보가 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '인센티브 삭제에 실패했습니다',
    });
  }
};
