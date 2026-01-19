import { prisma } from '../server';
import { Prisma } from '@prisma/client';

export interface SalaryData {
  baseSalary?: number;
  overtimePay?: number;
  nightPay?: number;
  holidayPay?: number;
  incentive?: number;
  bonus?: number;
  allowances?: number;
  nationalPension?: number;
  healthInsurance?: number;
  employmentIns?: number;
  incomeTax?: number;
  localIncomeTax?: number;
  otherDeductions?: number;
  notes?: string;
}

// 급여 목록 조회 (월별)
export const getSalaries = async (
  clinicId: string,
  year: number,
  month: number,
  page = 1,
  limit = 50
) => {
  const [salaries, total] = await Promise.all([
    prisma.salary.findMany({
      where: {
        clinicId,
        year,
        month,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            employmentType: true,
            status: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        employee: { name: 'asc' },
      },
    }),
    prisma.salary.count({
      where: { clinicId, year, month },
    }),
  ]);

  return {
    salaries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 직원별 급여 이력 조회
export const getEmployeeSalaryHistory = async (
  clinicId: string,
  employeeId: string,
  limit = 12
) => {
  return prisma.salary.findMany({
    where: {
      clinicId,
      employeeId,
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
    take: limit,
  });
};

// 급여 상세 조회
export const getSalary = async (clinicId: string, salaryId: string) => {
  return prisma.salary.findFirst({
    where: {
      id: salaryId,
      clinicId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
          employmentType: true,
          baseSalary: true,
        },
      },
    },
  });
};

// 급여 생성/수정 (upsert)
export const upsertSalary = async (
  clinicId: string,
  employeeId: string,
  year: number,
  month: number,
  data: SalaryData
) => {
  // 총 지급액 계산
  const grossSalary =
    (data.baseSalary || 0) +
    (data.overtimePay || 0) +
    (data.nightPay || 0) +
    (data.holidayPay || 0) +
    (data.incentive || 0) +
    (data.bonus || 0) +
    (data.allowances || 0);

  // 총 공제액 계산
  const totalDeductions =
    (data.nationalPension || 0) +
    (data.healthInsurance || 0) +
    (data.employmentIns || 0) +
    (data.incomeTax || 0) +
    (data.localIncomeTax || 0) +
    (data.otherDeductions || 0);

  // 실수령액 계산
  const netSalary = grossSalary - totalDeductions;

  return prisma.salary.upsert({
    where: {
      employeeId_year_month: {
        employeeId,
        year,
        month,
      },
    },
    update: {
      ...data,
      netSalary,
    },
    create: {
      clinicId,
      employeeId,
      year,
      month,
      ...data,
      netSalary,
    },
  });
};

// 급여 일괄 생성 (월 시작 시)
export const generateMonthlySalaries = async (
  clinicId: string,
  year: number,
  month: number
) => {
  // 재직 중인 직원 목록 조회
  const activeEmployees = await prisma.employee.findMany({
    where: {
      clinicId,
      status: 'ACTIVE',
    },
  });

  const results = [];

  for (const employee of activeEmployees) {
    // 이미 해당 월 급여가 있는지 확인
    const existing = await prisma.salary.findFirst({
      where: {
        employeeId: employee.id,
        year,
        month,
      },
    });

    if (!existing) {
      // 4대보험 자동 계산 (간이 계산식)
      const baseSalary = employee.baseSalary;
      const nationalPension = Math.round(baseSalary * 0.045); // 국민연금 4.5%
      const healthInsurance = Math.round(baseSalary * 0.03545); // 건강보험 3.545%
      const employmentIns = Math.round(baseSalary * 0.009); // 고용보험 0.9%

      const salary = await prisma.salary.create({
        data: {
          clinicId,
          employeeId: employee.id,
          year,
          month,
          baseSalary,
          nationalPension,
          healthInsurance,
          employmentIns,
          netSalary: baseSalary - nationalPension - healthInsurance - employmentIns,
        },
      });

      results.push(salary);
    }
  }

  return results;
};

// 급여 지급 처리
export const markAsPaid = async (
  clinicId: string,
  salaryIds: string[],
  paymentDate: Date
) => {
  return prisma.salary.updateMany({
    where: {
      id: { in: salaryIds },
      clinicId,
    },
    data: {
      isPaid: true,
      paymentDate,
    },
  });
};

// 월 급여 통계
export const getMonthlySalarySummary = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const salaries = await prisma.salary.findMany({
    where: {
      clinicId,
      year,
      month,
    },
    include: {
      employee: {
        select: {
          position: true,
          employmentType: true,
        },
      },
    },
  });

  const summary = {
    totalEmployees: salaries.length,
    totalBaseSalary: 0,
    totalOvertimePay: 0,
    totalIncentive: 0,
    totalBonus: 0,
    totalAllowances: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    paidCount: 0,
    unpaidCount: 0,
    byPosition: {} as Record<string, { count: number; total: number }>,
  };

  for (const salary of salaries) {
    summary.totalBaseSalary += salary.baseSalary;
    summary.totalOvertimePay += salary.overtimePay;
    summary.totalIncentive += salary.incentive;
    summary.totalBonus += salary.bonus;
    summary.totalAllowances += salary.allowances;
    summary.totalNetSalary += salary.netSalary;

    const gross = salary.baseSalary + salary.overtimePay + salary.nightPay +
      salary.holidayPay + salary.incentive + salary.bonus + salary.allowances;
    summary.totalGross += gross;

    const deductions = salary.nationalPension + salary.healthInsurance +
      salary.employmentIns + salary.incomeTax + salary.localIncomeTax + salary.otherDeductions;
    summary.totalDeductions += deductions;

    if (salary.isPaid) {
      summary.paidCount++;
    } else {
      summary.unpaidCount++;
    }

    const position = salary.employee.position;
    if (!summary.byPosition[position]) {
      summary.byPosition[position] = { count: 0, total: 0 };
    }
    summary.byPosition[position].count++;
    summary.byPosition[position].total += salary.netSalary;
  }

  return summary;
};

// 연간 급여 추이
export const getYearlySalaryTrend = async (clinicId: string, year: number) => {
  const salaries = await prisma.salary.findMany({
    where: {
      clinicId,
      year,
    },
  });

  const monthlyTotals: Record<number, { gross: number; net: number; count: number }> = {};

  for (let m = 1; m <= 12; m++) {
    monthlyTotals[m] = { gross: 0, net: 0, count: 0 };
  }

  for (const salary of salaries) {
    const gross = salary.baseSalary + salary.overtimePay + salary.nightPay +
      salary.holidayPay + salary.incentive + salary.bonus + salary.allowances;

    monthlyTotals[salary.month].gross += gross;
    monthlyTotals[salary.month].net += salary.netSalary;
    monthlyTotals[salary.month].count++;
  }

  return Object.entries(monthlyTotals).map(([month, data]) => ({
    month: parseInt(month),
    ...data,
  }));
};

// 급여 삭제
export const deleteSalary = async (clinicId: string, salaryId: string) => {
  const salary = await prisma.salary.findFirst({
    where: {
      id: salaryId,
      clinicId,
    },
  });

  if (!salary) {
    return null;
  }

  return prisma.salary.delete({
    where: { id: salaryId },
  });
};
