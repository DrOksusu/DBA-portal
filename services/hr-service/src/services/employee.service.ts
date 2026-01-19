import { prisma } from '../server';
import { Position, EmploymentType, EmployeeStatus, Prisma } from '@prisma/client';

export interface CreateEmployeeData {
  clinicId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  position: Position;
  employmentType?: EmploymentType;
  hireDate: Date;
  baseSalary?: number;
  notes?: string;
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  phone?: string;
  position?: Position;
  employmentType?: EmploymentType;
  baseSalary?: number;
  notes?: string;
}

export interface EmployeeFilter {
  clinicId: string;
  status?: EmployeeStatus;
  position?: Position;
  employmentType?: EmploymentType;
  search?: string;
}

// 직원 목록 조회
export const getEmployees = async (filter: EmployeeFilter, page = 1, limit = 20) => {
  const where: Prisma.EmployeeWhereInput = {
    clinicId: filter.clinicId,
  };

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.position) {
    where.position = filter.position;
  }

  if (filter.employmentType) {
    where.employmentType = filter.employmentType;
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search } },
      { email: { contains: filter.search } },
      { phone: { contains: filter.search } },
    ];
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { status: 'asc' },
        { name: 'asc' },
      ],
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 직원 상세 조회
export const getEmployee = async (clinicId: string, employeeId: string) => {
  return prisma.employee.findFirst({
    where: {
      id: employeeId,
      clinicId,
    },
    include: {
      salaries: {
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
        take: 12,
      },
      incentives: {
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
        take: 12,
      },
      salaryHistories: {
        orderBy: { effectiveDate: 'desc' },
        take: 10,
      },
    },
  });
};

// 직원 등록
export const createEmployee = async (data: CreateEmployeeData) => {
  return prisma.employee.create({
    data: {
      clinicId: data.clinicId,
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      employmentType: data.employmentType || 'FULL_TIME',
      hireDate: data.hireDate,
      baseSalary: data.baseSalary || 0,
      notes: data.notes,
    },
  });
};

// 직원 정보 수정
export const updateEmployee = async (
  clinicId: string,
  employeeId: string,
  data: UpdateEmployeeData,
  changedBy: string
) => {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, clinicId },
  });

  if (!employee) {
    return null;
  }

  // 기본급 변경 시 이력 저장
  if (data.baseSalary !== undefined && data.baseSalary !== employee.baseSalary) {
    await prisma.salaryHistory.create({
      data: {
        clinicId,
        employeeId,
        effectiveDate: new Date(),
        previousSalary: employee.baseSalary,
        newSalary: data.baseSalary,
        changeReason: '급여 변경',
        changedBy,
      },
    });
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data,
  });
};

// 퇴사 처리
export const resignEmployee = async (
  clinicId: string,
  employeeId: string,
  resignDate: Date,
  resignReason?: string
) => {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, clinicId },
  });

  if (!employee) {
    return null;
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      status: 'RESIGNED',
      resignDate,
      resignReason,
    },
  });
};

// 재직 복귀
export const reinstateEmployee = async (clinicId: string, employeeId: string) => {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, clinicId },
  });

  if (!employee) {
    return null;
  }

  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      status: 'ACTIVE',
      resignDate: null,
      resignReason: null,
    },
  });
};

// 직원 삭제 (soft delete는 아니지만, 실제로는 퇴사 처리 권장)
export const deleteEmployee = async (clinicId: string, employeeId: string) => {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, clinicId },
  });

  if (!employee) {
    return null;
  }

  return prisma.employee.delete({
    where: { id: employeeId },
  });
};

// 직원 통계
export const getEmployeeStats = async (clinicId: string) => {
  const [total, byStatus, byPosition, byEmploymentType] = await Promise.all([
    prisma.employee.count({ where: { clinicId } }),
    prisma.employee.groupBy({
      by: ['status'],
      where: { clinicId },
      _count: true,
    }),
    prisma.employee.groupBy({
      by: ['position'],
      where: { clinicId, status: 'ACTIVE' },
      _count: true,
    }),
    prisma.employee.groupBy({
      by: ['employmentType'],
      where: { clinicId, status: 'ACTIVE' },
      _count: true,
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
    byPosition: byPosition.reduce((acc, item) => {
      acc[item.position] = item._count;
      return acc;
    }, {} as Record<string, number>),
    byEmploymentType: byEmploymentType.reduce((acc, item) => {
      acc[item.employmentType] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};

// 직원 ID로 userId 조회 (다른 서비스에서 사용)
export const getEmployeesByUserIds = async (clinicId: string, userIds: string[]) => {
  return prisma.employee.findMany({
    where: {
      clinicId,
      userId: { in: userIds },
    },
  });
};
