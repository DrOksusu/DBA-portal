import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as stockService from '../services/stock.service';

const movementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum([
    'IN_PURCHASE', 'IN_RETURN', 'IN_ADJUSTMENT',
    'OUT_SALE', 'OUT_SAMPLE', 'OUT_DAMAGED', 'OUT_ADJUSTMENT'
  ]),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).optional(),
  supplierId: z.string().uuid().optional(),
  referenceNo: z.string().optional(),
  movementDate: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
});

const stockCheckSchema = z.object({
  checkDate: z.string().transform((str) => new Date(str)),
  results: z.array(z.object({
    productId: z.string().uuid(),
    systemStock: z.number().int(),
    actualStock: z.number().int(),
    difference: z.number().int(),
    notes: z.string().optional(),
  })),
  notes: z.string().optional(),
});

// 입출고 기록
export const recordMovement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = movementSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const movement = await stockService.recordMovement({
      clinicId,
      ...validation.data,
      createdBy: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      data: movement,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || '입출고 기록에 실패했습니다',
    });
  }
};

// 입출고 내역 조회
export const getMovements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { productId, type, startDate, endDate, supplierId, page, limit } = req.query;

    const result = await stockService.getMovements(
      clinicId,
      {
        productId: productId as string,
        type: type as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        supplierId: supplierId as string,
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
      error: '입출고 내역을 불러오는데 실패했습니다',
    });
  }
};

// 입출고 통계
export const getMovementStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { year, month } = req.params;

    const stats = await stockService.getMovementStats(
      clinicId,
      parseInt(year),
      parseInt(month)
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '입출고 통계를 불러오는데 실패했습니다',
    });
  }
};

// 현재 재고 현황
export const getCurrentStock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;

    const stock = await stockService.getCurrentStock(clinicId);

    return res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재고 현황을 불러오는데 실패했습니다',
    });
  }
};

// 재고 실사 생성
export const createStockCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = stockCheckSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const check = await stockService.createStockCheck({
      clinicId,
      ...validation.data,
      checkedBy: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      data: check,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재고 실사 생성에 실패했습니다',
    });
  }
};

// 재고 실사 목록 조회
export const getStockChecks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { page, limit } = req.query;

    const result = await stockService.getStockChecks(
      clinicId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재고 실사 목록을 불러오는데 실패했습니다',
    });
  }
};

// 재고 실사 상세 조회
export const getStockCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const check = await stockService.getStockCheck(clinicId, id);

    if (!check) {
      return res.status(404).json({
        success: false,
        error: '재고 실사를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: check,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재고 실사 정보를 불러오는데 실패했습니다',
    });
  }
};

// 재고 실사 반영
export const applyStockCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const check = await stockService.applyStockCheck(clinicId, id, req.user!.id);

    return res.json({
      success: true,
      data: check,
      message: '재고 실사가 반영되었습니다',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || '재고 실사 반영에 실패했습니다',
    });
  }
};
