import { Request, Response } from 'express';
import { z } from 'zod';
import * as dailyReportService from '../services/dailyReport.service';

// Validation schemas
const incomeSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  chartNumber: z.string().optional(),
  patientName: z.string().optional(),
  memo: z.string().optional(),
  cashAmount: z.number().int().min(0).optional(),
  cardAmount: z.number().int().min(0).optional(),
  transferAmount: z.number().int().min(0).optional(),
});

const expenseSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  memo: z.string().optional(),
  expenseAmount: z.number().int().min(0),
  expenseCategory: z.string().min(1, 'Category is required'),
});

const oralSaleSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  chartNumber: z.string().optional(),
  patientName: z.string().optional(),
  memo: z.string().optional(),
  productCode: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  discountRate: z.number().min(0).max(100).optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

export async function getDailyReports(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { date } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Date parameter required (YYYY-MM-DD)',
      });
    }

    const reports = await dailyReportService.getDailyReports(clinicId, date);

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get daily reports',
    });
  }
}

export async function createIncome(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID and User ID required',
      });
    }

    const validation = incomeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const report = await dailyReportService.createIncome(clinicId, userId, validation.data);

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create income record',
    });
  }
}

export async function createExpense(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID and User ID required',
      });
    }

    const validation = expenseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const report = await dailyReportService.createExpense(clinicId, userId, validation.data);

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create expense record',
    });
  }
}

export async function createOralSale(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID and User ID required',
      });
    }

    const validation = oralSaleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const report = await dailyReportService.createOralSale(clinicId, userId, validation.data);

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create oral sale record',
    });
  }
}

export async function updateDailyReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const report = await dailyReportService.updateDailyReport(id, clinicId, req.body);

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update daily report',
    });
  }
}

export async function deleteDailyReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    await dailyReportService.deleteDailyReport(id, clinicId);

    return res.json({
      success: true,
      message: 'Daily report deleted successfully',
    });
  } catch (error: any) {
    const message = error.message || 'Failed to delete daily report';
    return res.status(error.message?.includes('not found') ? 404 : 500).json({
      success: false,
      error: message,
    });
  }
}

export async function getDailyClosing(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { date } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Date parameter required (YYYY-MM-DD)',
      });
    }

    const closing = await dailyReportService.getDailyClosing(clinicId, date);

    return res.json({
      success: true,
      data: closing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get daily closing',
    });
  }
}

export async function getRevenueStats(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { year, month } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const yearNum = parseInt(year as string) || new Date().getFullYear();
    const monthNum = parseInt(month as string) || new Date().getMonth() + 1;

    const stats = await dailyReportService.getRevenueStats(clinicId, yearNum, monthNum);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get revenue stats',
    });
  }
}

export async function getInputDates(req: Request, res: Response) {
  try {
    const clinicId = req.user?.clinicId;
    const { year, month } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
      });
    }

    const yearNum = parseInt(year as string) || new Date().getFullYear();
    const monthNum = parseInt(month as string) || new Date().getMonth() + 1;

    const dates = await dailyReportService.getInputDates(clinicId, yearNum, monthNum);

    return res.json({
      success: true,
      data: dates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get input dates',
    });
  }
}
