import { prisma } from '../server';
import { StockMovementType, Prisma } from '@prisma/client';

export interface StockMovementData {
  clinicId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitPrice?: number;
  supplierId?: string;
  referenceNo?: string;
  movementDate: Date;
  notes?: string;
  createdBy: string;
}

export interface StockCheckData {
  clinicId: string;
  checkDate: Date;
  checkedBy: string;
  results: {
    productId: string;
    systemStock: number;
    actualStock: number;
    difference: number;
    notes?: string;
  }[];
  notes?: string;
}

// 입출고 유형이 입고인지 확인
const isInbound = (type: StockMovementType) => {
  return type.startsWith('IN_');
};

// 입출고 기록
export const recordMovement = async (data: StockMovementData) => {
  const product = await prisma.product.findFirst({
    where: {
      id: data.productId,
      clinicId: data.clinicId,
    },
  });

  if (!product) {
    throw new Error('제품을 찾을 수 없습니다');
  }

  const stockBefore = product.currentStock;
  const stockChange = isInbound(data.type) ? data.quantity : -data.quantity;
  const stockAfter = stockBefore + stockChange;

  if (stockAfter < 0) {
    throw new Error('재고가 부족합니다');
  }

  const totalAmount = data.unitPrice ? data.unitPrice * data.quantity : null;

  // 트랜잭션으로 재고 업데이트와 기록 동시 처리
  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        clinicId: data.clinicId,
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalAmount,
        supplierId: data.supplierId,
        referenceNo: data.referenceNo,
        movementDate: data.movementDate,
        stockBefore,
        stockAfter,
        notes: data.notes,
        createdBy: data.createdBy,
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { currentStock: stockAfter },
    }),
  ]);

  return movement;
};

// 입출고 내역 조회
export const getMovements = async (
  clinicId: string,
  filter: {
    productId?: string;
    type?: StockMovementType;
    startDate?: Date;
    endDate?: Date;
    supplierId?: string;
  },
  page = 1,
  limit = 50
) => {
  const where: Prisma.StockMovementWhereInput = {
    clinicId,
  };

  if (filter.productId) {
    where.productId = filter.productId;
  }

  if (filter.type) {
    where.type = filter.type;
  }

  if (filter.startDate || filter.endDate) {
    where.movementDate = {};
    if (filter.startDate) {
      where.movementDate.gte = filter.startDate;
    }
    if (filter.endDate) {
      where.movementDate.lte = filter.endDate;
    }
  }

  if (filter.supplierId) {
    where.supplierId = filter.supplierId;
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { movementDate: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 입출고 통계
export const getMovementStats = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const movements = await prisma.stockMovement.findMany({
    where: {
      clinicId,
      movementDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const stats = {
    totalIn: 0,
    totalOut: 0,
    totalInAmount: 0,
    totalOutAmount: 0,
    byType: {} as Record<string, { count: number; quantity: number; amount: number }>,
  };

  for (const movement of movements) {
    const isIn = isInbound(movement.type);

    if (isIn) {
      stats.totalIn += movement.quantity;
      stats.totalInAmount += movement.totalAmount || 0;
    } else {
      stats.totalOut += movement.quantity;
      stats.totalOutAmount += movement.totalAmount || 0;
    }

    if (!stats.byType[movement.type]) {
      stats.byType[movement.type] = { count: 0, quantity: 0, amount: 0 };
    }
    stats.byType[movement.type].count++;
    stats.byType[movement.type].quantity += movement.quantity;
    stats.byType[movement.type].amount += movement.totalAmount || 0;
  }

  return stats;
};

// 재고 실사 생성
export const createStockCheck = async (data: StockCheckData) => {
  return prisma.stockCheck.create({
    data: {
      clinicId: data.clinicId,
      checkDate: data.checkDate,
      checkedBy: data.checkedBy,
      results: JSON.stringify(data.results),
      notes: data.notes,
      status: 'DRAFT',
    },
  });
};

// 재고 실사 목록 조회
export const getStockChecks = async (clinicId: string, page = 1, limit = 20) => {
  const [checks, total] = await Promise.all([
    prisma.stockCheck.findMany({
      where: { clinicId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { checkDate: 'desc' },
    }),
    prisma.stockCheck.count({ where: { clinicId } }),
  ]);

  return {
    checks: checks.map(c => ({
      ...c,
      results: JSON.parse(c.results),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 재고 실사 상세 조회
export const getStockCheck = async (clinicId: string, checkId: string) => {
  const check = await prisma.stockCheck.findFirst({
    where: {
      id: checkId,
      clinicId,
    },
  });

  if (!check) return null;

  return {
    ...check,
    results: JSON.parse(check.results),
  };
};

// 재고 실사 반영 (재고 조정)
export const applyStockCheck = async (
  clinicId: string,
  checkId: string,
  adjustedBy: string
) => {
  const check = await prisma.stockCheck.findFirst({
    where: { id: checkId, clinicId },
  });

  if (!check) {
    throw new Error('실사 기록을 찾을 수 없습니다');
  }

  if (check.status === 'ADJUSTED') {
    throw new Error('이미 반영된 실사입니다');
  }

  const results = JSON.parse(check.results) as {
    productId: string;
    systemStock: number;
    actualStock: number;
    difference: number;
    notes?: string;
  }[];

  // 차이가 있는 항목에 대해 재고 조정
  for (const result of results) {
    if (result.difference !== 0) {
      const type = result.difference > 0 ? 'IN_ADJUSTMENT' : 'OUT_ADJUSTMENT';
      const quantity = Math.abs(result.difference);

      await recordMovement({
        clinicId,
        productId: result.productId,
        type: type as StockMovementType,
        quantity,
        movementDate: new Date(),
        notes: `재고 실사 반영: ${result.notes || ''}`,
        createdBy: adjustedBy,
      });
    }
  }

  // 실사 상태 업데이트
  return prisma.stockCheck.update({
    where: { id: checkId },
    data: {
      status: 'ADJUSTED',
      adjustedAt: new Date(),
      adjustedBy,
    },
  });
};

// 현재 재고 현황
export const getCurrentStock = async (clinicId: string) => {
  const products = await prisma.product.findMany({
    where: {
      clinicId,
      isActive: true,
    },
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
      currentStock: true,
      minStock: true,
      maxStock: true,
      purchasePrice: true,
      sellingPrice: true,
    },
    orderBy: { name: 'asc' },
  });

  return products.map(p => ({
    ...p,
    isLowStock: p.currentStock <= p.minStock,
    isOverStock: p.maxStock ? p.currentStock > p.maxStock : false,
    stockValue: p.currentStock * p.purchasePrice,
  }));
};
