import { prisma } from '../server';
import { ProductCategory, Prisma } from '@prisma/client';

export interface CreateProductData {
  clinicId: string;
  code: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  description?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  minStock?: number;
  maxStock?: number;
}

export interface UpdateProductData {
  name?: string;
  category?: ProductCategory;
  brand?: string;
  description?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}

export interface ProductFilter {
  clinicId: string;
  category?: ProductCategory;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
}

// 제품 목록 조회
export const getProducts = async (filter: ProductFilter, page = 1, limit = 20) => {
  const where: Prisma.ProductWhereInput = {
    clinicId: filter.clinicId,
  };

  if (filter.category) {
    where.category = filter.category;
  }

  if (filter.isActive !== undefined) {
    where.isActive = filter.isActive;
  }

  if (filter.lowStock) {
    where.currentStock = {
      lte: prisma.product.fields.minStock,
    };
  }

  if (filter.search) {
    where.OR = [
      { code: { contains: filter.search } },
      { name: { contains: filter.search } },
      { brand: { contains: filter.search } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        suppliers: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: { isPrimary: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 제품 상세 조회
export const getProduct = async (clinicId: string, productId: string) => {
  return prisma.product.findFirst({
    where: {
      id: productId,
      clinicId,
    },
    include: {
      suppliers: {
        include: {
          supplier: true,
        },
      },
      stockMovements: {
        orderBy: { movementDate: 'desc' },
        take: 10,
      },
    },
  });
};

// 제품 코드로 조회
export const getProductByCode = async (clinicId: string, code: string) => {
  return prisma.product.findFirst({
    where: {
      clinicId,
      code,
    },
  });
};

// 제품 등록
export const createProduct = async (data: CreateProductData) => {
  return prisma.product.create({
    data: {
      clinicId: data.clinicId,
      code: data.code,
      name: data.name,
      category: data.category,
      brand: data.brand,
      description: data.description,
      purchasePrice: data.purchasePrice || 0,
      sellingPrice: data.sellingPrice || 0,
      minStock: data.minStock || 0,
      maxStock: data.maxStock,
    },
  });
};

// 제품 수정
export const updateProduct = async (
  clinicId: string,
  productId: string,
  data: UpdateProductData
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, clinicId },
  });

  if (!product) {
    return null;
  }

  return prisma.product.update({
    where: { id: productId },
    data,
  });
};

// 제품 삭제
export const deleteProduct = async (clinicId: string, productId: string) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, clinicId },
  });

  if (!product) {
    return null;
  }

  return prisma.product.delete({
    where: { id: productId },
  });
};

// 재고 부족 제품 조회
export const getLowStockProducts = async (clinicId: string) => {
  const products = await prisma.product.findMany({
    where: {
      clinicId,
      isActive: true,
    },
  });

  return products.filter(p => p.currentStock <= p.minStock);
};

// 제품 통계
export const getProductStats = async (clinicId: string) => {
  const [total, byCategory, lowStock, totalValue] = await Promise.all([
    prisma.product.count({
      where: { clinicId, isActive: true },
    }),
    prisma.product.groupBy({
      by: ['category'],
      where: { clinicId, isActive: true },
      _count: true,
    }),
    prisma.product.findMany({
      where: { clinicId, isActive: true },
    }).then(products => products.filter(p => p.currentStock <= p.minStock).length),
    prisma.product.aggregate({
      where: { clinicId, isActive: true },
      _sum: {
        currentStock: true,
      },
    }),
  ]);

  // 재고 금액 계산
  const products = await prisma.product.findMany({
    where: { clinicId, isActive: true },
    select: { currentStock: true, purchasePrice: true },
  });

  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.currentStock * p.purchasePrice),
    0
  );

  return {
    totalProducts: total,
    totalStock: totalValue._sum.currentStock || 0,
    inventoryValue,
    lowStockCount: lowStock,
    byCategory: byCategory.reduce((acc, item) => {
      acc[item.category] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};

// 공급업체 연결
export const linkSupplier = async (
  productId: string,
  supplierId: string,
  data: {
    supplierProductCode?: string;
    unitPrice?: number;
    leadDays?: number;
    isPrimary?: boolean;
  }
) => {
  // 주 공급업체로 설정 시 기존 주 공급업체 해제
  if (data.isPrimary) {
    await prisma.productSupplier.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.productSupplier.upsert({
    where: {
      productId_supplierId: { productId, supplierId },
    },
    update: data,
    create: {
      productId,
      supplierId,
      ...data,
    },
  });
};

// 공급업체 연결 해제
export const unlinkSupplier = async (productId: string, supplierId: string) => {
  return prisma.productSupplier.delete({
    where: {
      productId_supplierId: { productId, supplierId },
    },
  });
};
