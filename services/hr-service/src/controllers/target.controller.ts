import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as targetService from '../services/target.service';

const setTargetSchema = z.object({
  targetAmount: z.number().min(0),
  notes: z.string().optional(),
});

const setMonthlyTargetsSchema = z.object({
  targets: z.array(z.object({
    month: z.number().int().min(1).max(12),
    targetAmount: z.number().min(0),
    notes: z.string().optional(),
  })),
});

// 연도별 목표 목록 조회
export const getTargets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year } = req.params;

    const targets = await targetService.getTargets(clinicId, parseInt(year));

    return res.json({
      success: true,
      data: targets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '목표 목록을 불러오는데 실패했습니다',
    });
  }
};

// 목표 상세 조회
export const getTarget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const target = await targetService.getTarget(
      clinicId,
      parseInt(year),
      month ? parseInt(month) : null
    );

    if (!target) {
      return res.status(404).json({
        success: false,
        error: '목표를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: target,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '목표 정보를 불러오는데 실패했습니다',
    });
  }
};

// 목표 설정
export const setTarget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;
    const validation = setTargetSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const target = await targetService.setTarget(
      clinicId,
      parseInt(year),
      month ? parseInt(month) : null,
      validation.data
    );

    return res.json({
      success: true,
      data: target,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '목표 설정에 실패했습니다',
    });
  }
};

// 월별 목표 일괄 설정
export const setMonthlyTargets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year } = req.params;
    const validation = setMonthlyTargetsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const targets = await targetService.setMonthlyTargets(
      clinicId,
      parseInt(year),
      validation.data.targets
    );

    return res.json({
      success: true,
      data: targets,
      message: `${targets.length}개월 목표가 설정되었습니다`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '목표 일괄 설정에 실패했습니다',
    });
  }
};

// 실적 동기화
export const syncActual = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const result = await targetService.syncActualRevenue(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: '목표를 찾을 수 없거나 실적 조회에 실패했습니다',
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '실적 동기화에 실패했습니다',
    });
  }
};

// 연간 목표 달성 현황
export const getYearlyProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year } = req.params;

    const progress = await targetService.getYearlyProgress(clinicId, parseInt(year));

    return res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '연간 현황을 불러오는데 실패했습니다',
    });
  }
};

// 목표 대비 실적 비교
export const getTargetVsActual = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const comparison = await targetService.getTargetVsActual(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: '목표를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '목표 대비 실적 조회에 실패했습니다',
    });
  }
};

// 목표 삭제
export const deleteTarget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const target = await targetService.deleteTarget(clinicId, id);

    if (!target) {
      return res.status(404).json({
        success: false,
        error: '목표를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '목표가 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '목표 삭제에 실패했습니다',
    });
  }
};
