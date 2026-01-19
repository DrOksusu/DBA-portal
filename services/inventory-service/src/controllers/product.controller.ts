import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as productService from '../services/product.service';

const createProductSchema = z.object({
  code: z.string().min(1, '제품 코드는 필수입니다'),
  name: z.string().min(1, '제품명은 필수입니다'),
  category: z.enum([
    'TOOTHBRUSH', 'TOOTHPASTE', 'MOUTHWASH', 'FLOSS', 'INTERDENTAL',
    'WHITENING', 'KIDS', 'ORTHODONTIC', 'IMPLANT_CARE', 'GUM_CARE', 'OTHER'
  ]),
  brand: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
});

const updateProductSchema = createProductSchema.partial().omit({ code: true });

const linkSupplierSchema = z.object({
  supplierId: z.string().uuid(),
  supplierProductCode: z.string().optional(),
  unitPrice: z.number().min(0).optional(),
  leadDays: z.number().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

// 제품 목록 조회
export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { category, isActive, lowStock, search, page, limit } = req.query;

    const result = await productService.getProducts(
      {
        clinicId,
        category: category as any,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        lowStock: lowStock === 'true',
        search: search as string,
      },
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
      error: '제품 목록을 불러오는데 실패했습니다',
    });
  }
};

// 제품 상세 조회
export const getProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const product = await productService.getProduct(clinicId, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '제품을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '제품 정보를 불러오는데 실패했습니다',
    });
  }
};

// 제품 등록
export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    // 코드 중복 확인
    const existing = await productService.getProductByCode(clinicId, validation.data.code);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 제품 코드입니다',
      });
    }

    const product = await productService.createProduct({
      clinicId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '제품 등록에 실패했습니다',
    });
  }
};

// 제품 수정
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;
    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const product = await productService.updateProduct(clinicId, id, validation.data);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '제품을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '제품 수정에 실패했습니다',
    });
  }
};

// 제품 삭제
export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;
    const { id } = req.params;

    const product = await productService.deleteProduct(clinicId, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '제품을 찾을 수 없습니다',
      });
    }

    return res.json({
      success: true,
      message: '제품이 삭제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '제품 삭제에 실패했습니다',
    });
  }
};

// 재고 부족 제품 조회
export const getLowStockProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;

    const products = await productService.getLowStockProducts(clinicId);

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '재고 부족 제품 조회에 실패했습니다',
    });
  }
};

// 제품 통계
export const getProductStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clinicId = req.user!.clinicId!;

    const stats = await productService.getProductStats(clinicId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '제품 통계를 불러오는데 실패했습니다',
    });
  }
};

// 공급업체 연결
export const linkSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validation = linkSupplierSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const link = await productService.linkSupplier(id, validation.data.supplierId, {
      supplierProductCode: validation.data.supplierProductCode,
      unitPrice: validation.data.unitPrice,
      leadDays: validation.data.leadDays,
      isPrimary: validation.data.isPrimary,
    });

    return res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 연결에 실패했습니다',
    });
  }
};

// 공급업체 연결 해제
export const unlinkSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, supplierId } = req.params;

    await productService.unlinkSupplier(id, supplierId);

    return res.json({
      success: true,
      message: '공급업체 연결이 해제되었습니다',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '공급업체 연결 해제에 실패했습니다',
    });
  }
};
