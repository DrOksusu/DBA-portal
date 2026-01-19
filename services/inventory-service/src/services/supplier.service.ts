import { prisma } from '../server';
import { Prisma } from '@prisma/client';

export interface CreateSupplierData {
  clinicId: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierData {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

// 공급업체 목록 조회
export const getSuppliers = async (
  clinicId: string,
  includeInactive = false,
  page = 1,
  limit = 20
) => {
  const where: Prisma.SupplierWhereInput = {
    clinicId,
    ...(includeInactive ? {} : { isActive: true }),
  };

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.supplier.count({ where }),
  ]);

  return {
    suppliers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 공급업체 상세 조회
export const getSupplier = async (clinicId: string, supplierId: string) => {
  return prisma.supplier.findFirst({
    where: {
      id: supplierId,
      clinicId,
    },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true,
              currentStock: true,
            },
          },
        },
      },
    },
  });
};

// 공급업체 등록
export const createSupplier = async (data: CreateSupplierData) => {
  return prisma.supplier.create({
    data: {
      clinicId: data.clinicId,
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
    },
  });
};

// 공급업체 수정
export const updateSupplier = async (
  clinicId: string,
  supplierId: string,
  data: UpdateSupplierData
) => {
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, clinicId },
  });

  if (!supplier) {
    return null;
  }

  return prisma.supplier.update({
    where: { id: supplierId },
    data,
  });
};

// 공급업체 삭제
export const deleteSupplier = async (clinicId: string, supplierId: string) => {
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, clinicId },
  });

  if (!supplier) {
    return null;
  }

  return prisma.supplier.delete({
    where: { id: supplierId },
  });
};

// 공급업체별 제품 목록
export const getSupplierProducts = async (clinicId: string, supplierId: string) => {
  const supplierProducts = await prisma.productSupplier.findMany({
    where: {
      supplierId,
      product: {
        clinicId,
      },
    },
    include: {
      product: true,
    },
  });

  return supplierProducts.map(sp => ({
    ...sp.product,
    supplierInfo: {
      supplierProductCode: sp.supplierProductCode,
      unitPrice: sp.unitPrice,
      leadDays: sp.leadDays,
      isPrimary: sp.isPrimary,
    },
  }));
};
