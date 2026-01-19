import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as expenseService from '../services/expense.service';

const createExpenseSchema = z.object({
  campaignId: z.string().uuid().optional(),
  type: z.enum(['ADVERTISING', 'CONTENT', 'PLATFORM', 'AGENCY', 'MATERIAL', 'EVENT', 'OTHER']),
  channel: z.enum([
    'NAVER_PLACE', 'NAVER_BLOG', 'NAVER_SEARCH', 'GOOGLE_ADS',
    'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'KAKAO',
    'OFFLINE', 'REFERRAL', 'EVENT', 'OTHER'
  ]).optional(),
  description: z.string().min(1, '설명은 필수입니다'),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다'),
  expenseDate: z.string().transform((str) => new Date(str)),
  receiptNo: z.string().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

const updateExpenseSchema = createExpenseSchema.partial();

// 비용 목록 조회
export const getExpenses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { campaignId, type, channel, startDate, endDate, page, limit } = req.query;

    const result = await expenseService.getExpenses(
      {
        clinicId,
        campaignId: campaignId as string,
        type: type as any,
        channel: channel as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
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
      error: '비용 목록을 불러오는데 실패했습니다',
    });
  }
};

// 비용 상세 조회
export const getExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const expense = await expenseService.getExpense(clinicId, id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: '비용을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '비용 정보를 불러오는데 실패했습니다',
    });
  }
};

// 비용 등록
export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createExpenseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const expense = await expenseService.createExpense({
      clinicId,
      ...validation.data,
      createdBy: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '비용 등록에 실패했습니다',
    });
  }
};

// 비용 수정
export const updateExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateExpenseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const expense = await expenseService.updateExpense(clinicId, id, validation.data);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: '비용을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '비용 수정에 실패했습니다',
    });
  }
};

// 비용 삭제
export const deleteExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const expense = await expenseService.deleteExpense(clinicId, id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: '비용을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '비용이 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '비용 삭제에 실패했습니다',
    });
  }
};

// 월별 비용 합계
export const getMonthlyTotal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const total = await expenseService.getMonthlyExpenseTotal(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    return res.json({
      success: true,
      data: total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '월별 비용 합계를 불러오는데 실패했습니다',
    });
  }
};

// 연간 비용 추이
export const getYearlyTrend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year } = req.params;

    const trend = await expenseService.getYearlyExpenseTrend(clinicId, parseInt(year));

    return res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '연간 비용 추이를 불러오는데 실패했습니다',
    });
  }
};
