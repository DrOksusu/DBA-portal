import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as supplierService from '../services/supplier.service';

const createSupplierSchema = z.object({
  name: z.string().min(1, '업체명은 필수입니다'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updateSupplierSchema = createSupplierSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// 공급업체 목록 조회
export const getSuppliers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { includeInactive, page, limit } = req.query;

    const result = await supplierService.getSuppliers(
      clinicId,
      includeInactive === 'true',
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
      error: '공급업체 목록을 불러오는데 실패했습니다',
    });
  }
};

// 공급업체 상세 조회
export const getSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const supplier = await supplierService.getSupplier(clinicId, id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: '공급업체를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 정보를 불러오는데 실패했습니다',
    });
  }
};

// 공급업체 등록
export const createSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createSupplierSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const supplier = await supplierService.createSupplier({
      clinicId,
      ...validation.data,
      email: validation.data.email || undefined,
    });

    return res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 등록에 실패했습니다',
    });
  }
};

// 공급업체 수정
export const updateSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateSupplierSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const supplier = await supplierService.updateSupplier(clinicId, id, {
      ...validation.data,
      email: validation.data.email || undefined,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: '공급업체를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 수정에 실패했습니다',
    });
  }
};

// 공급업체 삭제
export const deleteSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const supplier = await supplierService.deleteSupplier(clinicId, id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: '공급업체를 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '공급업체가 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 삭제에 실패했습니다',
    });
  }
};

// 공급업체별 제품 목록
export const getSupplierProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const products = await supplierService.getSupplierProducts(clinicId, id);

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 제품 목록을 불러오는데 실패했습니다',
    });
  }
};
