import { prisma } from '../server';
import { DailyReportType } from '@prisma/client';

export interface CreateIncomeDto {
  reportDate: string;
  chartNumber?: string;
  patientName?: string;
  memo?: string;
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
}

export interface CreateExpenseDto {
  reportDate: string;
  memo?: string;
  expenseAmount: number;
  expenseCategory: string;
}

export interface CreateOralSaleDto {
  reportDate: string;
  chartNumber?: string;
  patientName?: string;
  memo?: string;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  paymentMethod: string;
}

export async function getDailyReports(clinicId: string, date: string) {
  return prisma.dailyReport.findMany({
    where: {
      clinicId,
      reportDate: date,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getDailyReportsByDateRange(
  clinicId: string,
  startDate: string,
  endDate: string
) {
  return prisma.dailyReport.findMany({
    where: {
      clinicId,
      reportDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { reportDate: 'asc' },
  });
}

export async function createIncome(clinicId: string, userId: string, data: CreateIncomeDto) {
  return prisma.dailyReport.create({
    data: {
      clinicId,
      userId,
      type: DailyReportType.INCOME,
      reportDate: data.reportDate,
      chartNumber: data.chartNumber,
      patientName: data.patientName,
      memo: data.memo,
      cashAmount: data.cashAmount || 0,
      cardAmount: data.cardAmount || 0,
      transferAmount: data.transferAmount || 0,
    },
  });
}

export async function createExpense(clinicId: string, userId: string, data: CreateExpenseDto) {
  return prisma.dailyReport.create({
    data: {
      clinicId,
      userId,
      type: DailyReportType.EXPENSE,
      reportDate: data.reportDate,
      memo: data.memo,
      expenseAmount: data.expenseAmount,
      expenseCategory: data.expenseCategory,
    },
  });
}

export async function createOralSale(clinicId: string, userId: string, data: CreateOralSaleDto) {
  return prisma.dailyReport.create({
    data: {
      clinicId,
      userId,
      type: DailyReportType.ORAL_PRODUCT_SALE,
      reportDate: data.reportDate,
      chartNumber: data.chartNumber,
      patientName: data.patientName,
      memo: data.memo,
      productCode: data.productCode,
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discountRate: data.discountRate,
      paymentMethod: data.paymentMethod,
    },
  });
}

export async function updateDailyReport(id: string, clinicId: string, data: any) {
  return prisma.dailyReport.update({
    where: { id },
    data: {
      ...data,
      clinicId, // Ensure clinic ID matches
    },
  });
}

export async function deleteDailyReport(id: string, clinicId: string) {
  // First verify the report belongs to the clinic
  const report = await prisma.dailyReport.findFirst({
    where: { id, clinicId },
  });

  if (!report) {
    throw new Error('Report not found or access denied');
  }

  return prisma.dailyReport.delete({
    where: { id },
  });
}

export async function getDailyClosing(clinicId: string, date: string) {
  const reports = await getDailyReports(clinicId, date);

  const income = reports.filter(r => r.type === DailyReportType.INCOME);
  const expenses = reports.filter(r => r.type === DailyReportType.EXPENSE);
  const oralSales = reports.filter(r => r.type === DailyReportType.ORAL_PRODUCT_SALE);

  const totalCash = income.reduce((sum, r) => sum + (r.cashAmount || 0), 0);
  const totalCard = income.reduce((sum, r) => sum + (r.cardAmount || 0), 0);
  const totalTransfer = income.reduce((sum, r) => sum + (r.transferAmount || 0), 0);
  const totalIncome = totalCash + totalCard + totalTransfer;

  const totalExpense = expenses.reduce((sum, r) => sum + (r.expenseAmount || 0), 0);

  const oralSalesTotal = oralSales.reduce((sum, r) => {
    const amount = (r.quantity || 0) * (r.unitPrice || 0);
    const discount = amount * (Number(r.discountRate) || 0) / 100;
    return sum + (amount - discount);
  }, 0);

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    const category = e.expenseCategory || '기타';
    expenseByCategory[category] = (expenseByCategory[category] || 0) + (e.expenseAmount || 0);
  });

  return {
    date,
    income: {
      cash: totalCash,
      card: totalCard,
      transfer: totalTransfer,
      total: totalIncome,
      count: income.length,
    },
    expense: {
      total: totalExpense,
      byCategory: expenseByCategory,
      count: expenses.length,
    },
    oralSales: {
      total: oralSalesTotal,
      count: oralSales.length,
    },
    netTotal: totalIncome + oralSalesTotal - totalExpense,
  };
}

export async function getRevenueStats(clinicId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const reports = await getDailyReportsByDateRange(clinicId, startDate, endDate);

  const incomeReports = reports.filter(r => r.type === DailyReportType.INCOME);
  const expenseReports = reports.filter(r => r.type === DailyReportType.EXPENSE);

  const totalCash = incomeReports.reduce((sum, r) => sum + (r.cashAmount || 0), 0);
  const totalCard = incomeReports.reduce((sum, r) => sum + (r.cardAmount || 0), 0);
  const totalTransfer = incomeReports.reduce((sum, r) => sum + (r.transferAmount || 0), 0);
  const totalRevenue = totalCash + totalCard + totalTransfer;
  const totalExpense = expenseReports.reduce((sum, r) => sum + (r.expenseAmount || 0), 0);

  // Get unique dates with data
  const datesWithData = [...new Set(reports.map(r => r.reportDate))];

  return {
    year,
    month,
    totalRevenue,
    cashRevenue: totalCash,
    cardRevenue: totalCard,
    transferRevenue: totalTransfer,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    transactionCount: incomeReports.length,
    daysWithData: datesWithData.length,
    dailyAverage: datesWithData.length > 0 ? Math.round(totalRevenue / datesWithData.length) : 0,
  };
}

export async function getInputDates(clinicId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const reports = await prisma.dailyReport.findMany({
    where: {
      clinicId,
      reportDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      reportDate: true,
    },
    distinct: ['reportDate'],
    orderBy: { reportDate: 'asc' },
  });

  return reports.map(r => r.reportDate);
}
