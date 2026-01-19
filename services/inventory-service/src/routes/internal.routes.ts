import { Router } from 'express';
import { verifyInternalToken } from '../middlewares/auth.middleware';
import { prisma } from '../server';

const router = Router();

router.use(verifyInternalToken);

// 제품 목록 조회 (다른 서비스에서 사용)
router.get('/products', async (req, res) => {
  try {
    const { clinicId, isActive } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'clinicId is required',
      });
    }

    const products = await prisma.product.findMany({
      where: {
        clinicId: clinicId as string,
        ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
      },
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        sellingPrice: true,
        currentStock: true,
      },
    });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get products',
    });
  }
});

// 제품 코드로 조회
router.get('/products/by-code/:code', async (req, res) => {
  try {
    const { clinicId } = req.query;
    const { code } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'clinicId is required',
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        clinicId: clinicId as string,
        code,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get product',
    });
  }
});

// 재고 현황 조회
router.get('/stock/summary', async (req, res) => {
  try {
    const { clinicId } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'clinicId is required',
      });
    }

    const products = await prisma.product.findMany({
      where: {
        clinicId: clinicId as string,
        isActive: true,
      },
      select: {
        currentStock: true,
        purchasePrice: true,
      },
    });

    const summary = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.currentStock, 0),
      inventoryValue: products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0),
    };

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get stock summary',
    });
  }
});

// 판매 출고 기록 (Revenue Service에서 호출)
router.post('/stock/sale', async (req, res) => {
  try {
    const { clinicId, productId, quantity, unitPrice, referenceNo, createdBy } = req.body;

    if (!clinicId || !productId || !quantity || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'clinicId, productId, quantity, and createdBy are required',
      });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, clinicId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (product.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
      });
    }

    const stockBefore = product.currentStock;
    const stockAfter = stockBefore - quantity;

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          clinicId,
          productId,
          type: 'OUT_SALE',
          quantity,
          unitPrice,
          totalAmount: unitPrice ? unitPrice * quantity : null,
          referenceNo,
          movementDate: new Date(),
          stockBefore,
          stockAfter,
          createdBy,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: stockAfter },
      }),
    ]);

    return res.json({
      success: true,
      data: movement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to record sale',
    });
  }
});

export default router;
