import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as salaryService from '../services/salary.service';

const salaryDataSchema = z.object({
  baseSalary: z.number().min(0).optional(),
  overtimePay: z.number().min(0).optional(),
  nightPay: z.number().min(0).optional(),
  holidayPay: z.number().min(0).optional(),
  incentive: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  nationalPension: z.number().min(0).optional(),
  healthInsurance: z.number().min(0).optional(),
  employmentIns: z.number().min(0).optional(),
  incomeTax: z.number().min(0).optional(),
  localIncomeTax: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const markPaidSchema = z.object({
  salaryIds: z.array(z.string().uuid()),
  paymentDate: z.string().transform((str) => new Date(str)),
});

// 월별 급여 목록 조회
export const getMonthlySalaries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;
    const { page, limit } = req.query;

    const result = await salaryService.getSalaries(
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
      error: '급여 목록을 불러오는데 실패했습니다',
    });
  }
};

// 직원별 급여 이력 조회
export const getEmployeeSalaryHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { employeeId } = req.params;
    const { limit } = req.query;

    const salaries = await salaryService.getEmployeeSalaryHistory(
      clinicId,
      employeeId,
      limit ? parseInt(limit as string) : 12
    );

    return res.json({
      success: true,
      data: salaries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 이력을 불러오는데 실패했습니다',
    });
  }
};

// 급여 상세 조회
export const getSalary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const salary = await salaryService.getSalary(clinicId, id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        error: '급여 정보를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: salary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 정보를 불러오는데 실패했습니다',
    });
  }
};

// 급여 생성/수정
export const upsertSalary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { employeeId, year, month } = req.params;
    const validation = salaryDataSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const salary = await salaryService.upsertSalary(
      clinicId,
      employeeId,
      parseInt(year),
      parseInt(month),
      validation.data
    );

    return res.json({
      success: true,
      data: salary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 저장에 실패했습니다',
    });
  }
};

// 월 급여 일괄 생성
export const generateMonthlySalaries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const salaries = await salaryService.generateMonthlySalaries(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    return res.json({
      success: true,
      data: salaries,
      message: `${salaries.length}명의 급여가 생성되었습니다`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 일괄 생성에 실패했습니다',
    });
  }
};

// 급여 지급 처리
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

    const result = await salaryService.markAsPaid(
      clinicId,
      validation.data.salaryIds,
      validation.data.paymentDate
    );

    return res.json({
      success: true,
      data: { updatedCount: result.count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 지급 처리에 실패했습니다',
    });
  }
};

// 월 급여 통계
export const getMonthlySummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const summary = await salaryService.getMonthlySalarySummary(
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
      error: '급여 통계를 불러오는데 실패했습니다',
    });
  }
};

// 연간 급여 추이
export const getYearlyTrend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year } = req.params;

    const trend = await salaryService.getYearlySalaryTrend(clinicId, parseInt(year));

    return res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 추이를 불러오는데 실패했습니다',
    });
  }
};

// 급여 삭제
export const deleteSalary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const salary = await salaryService.deleteSalary(clinicId, id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        error: '급여 정보를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '급여 정보가 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '급여 삭제에 실패했습니다',
    });
  }
};
