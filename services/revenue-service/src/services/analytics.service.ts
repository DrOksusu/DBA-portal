import { prisma } from '../server';
import { DailyReportType } from '@prisma/client';

export async function getMonthlyAnalytics(clinicId: string, year: number, month: number) {
  // Check cache first
  const cached = await prisma.monthlyAnalyticsCache.findUnique({
    where: {
      clinicId_year_month: { clinicId, year, month },
    },
  });

  // If cache is fresh (updated within last hour), return it
  if (cached && new Date().getTime() - cached.updatedAt.getTime() < 3600000) {
    return cached;
  }

  // Calculate fresh analytics
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
  });

  const incomeReports = reports.filter(r => r.type === DailyReportType.INCOME);
  const expenseReports = reports.filter(r => r.type === DailyReportType.EXPENSE);
  const oralSaleReports = reports.filter(r => r.type === DailyReportType.ORAL_PRODUCT_SALE);

  // Calculate totals
  const cashRevenue = incomeReports.reduce((sum, r) => sum + (r.cashAmount || 0), 0);
  const cardRevenue = incomeReports.reduce((sum, r) => sum + (r.cardAmount || 0), 0);
  const transferRevenue = incomeReports.reduce((sum, r) => sum + (r.transferAmount || 0), 0);
  const totalRevenue = cashRevenue + cardRevenue + transferRevenue;

  const totalExpense = expenseReports.reduce((sum, r) => sum + (r.expenseAmount || 0), 0);

  // Expense by category
  const expenseByCategory: Record<string, number> = {};
  expenseReports.forEach(r => {
    const category = r.expenseCategory || '기타';
    expenseByCategory[category] = (expenseByCategory[category] || 0) + (r.expenseAmount || 0);
  });

  // Oral product sales
  const oralProductSales = oralSaleReports.reduce((sum, r) => {
    const amount = (r.quantity || 0) * (r.unitPrice || 0);
    const discount = amount * (Number(r.discountRate) || 0) / 100;
    return sum + (amount - discount);
  }, 0);
  const oralProductQuantity = oralSaleReports.reduce((sum, r) => sum + (r.quantity || 0), 0);

  // Net profit and margin
  const netProfit = totalRevenue + oralProductSales - totalExpense;
  const totalIncome = totalRevenue + oralProductSales;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Unique dates and patient count
  const uniqueDates = [...new Set(reports.map(r => r.reportDate))];
  const uniquePatients = [...new Set(incomeReports.map(r => r.chartNumber).filter(Boolean))];
  const dailyAverageRevenue = uniqueDates.length > 0 ? Math.round(totalRevenue / uniqueDates.length) : 0;

  const analyticsData = {
    clinicId,
    year,
    month,
    totalRevenue,
    cashRevenue,
    cardRevenue,
    transferRevenue,
    totalExpense,
    expenseByCategory,
    oralProductSales,
    oralProductQuantity,
    netProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    dailyAverageRevenue,
    transactionCount: incomeReports.length,
    patientCount: uniquePatients.length,
  };

  // Update cache
  await prisma.monthlyAnalyticsCache.upsert({
    where: {
      clinicId_year_month: { clinicId, year, month },
    },
    update: analyticsData,
    create: analyticsData,
  });

  return analyticsData;
}

export async function getYearlyAnalytics(clinicId: string, year: number) {
  const monthlyData = [];

  for (let month = 1; month <= 12; month++) {
    const data = await getMonthlyAnalytics(clinicId, year, month);
    monthlyData.push({
      month,
      ...data,
    });
  }

  // Calculate yearly totals
  const yearlyTotals = monthlyData.reduce(
    (acc, m) => ({
      totalRevenue: acc.totalRevenue + m.totalRevenue,
      cashRevenue: acc.cashRevenue + m.cashRevenue,
      cardRevenue: acc.cardRevenue + m.cardRevenue,
      transferRevenue: acc.transferRevenue + m.transferRevenue,
      totalExpense: acc.totalExpense + m.totalExpense,
      oralProductSales: acc.oralProductSales + m.oralProductSales,
      oralProductQuantity: acc.oralProductQuantity + m.oralProductQuantity,
      netProfit: acc.netProfit + m.netProfit,
      transactionCount: acc.transactionCount + m.transactionCount,
      patientCount: acc.patientCount + m.patientCount,
    }),
    {
      totalRevenue: 0,
      cashRevenue: 0,
      cardRevenue: 0,
      transferRevenue: 0,
      totalExpense: 0,
      oralProductSales: 0,
      oralProductQuantity: 0,
      netProfit: 0,
      transactionCount: 0,
      patientCount: 0,
    }
  );

  const totalIncome = yearlyTotals.totalRevenue + yearlyTotals.oralProductSales;
  const profitMargin = totalIncome > 0 ? (yearlyTotals.netProfit / totalIncome) * 100 : 0;

  return {
    year,
    summary: {
      ...yearlyTotals,
      profitMargin: Math.round(profitMargin * 100) / 100,
      monthlyAverageRevenue: Math.round(yearlyTotals.totalRevenue / 12),
    },
    monthly: monthlyData,
  };
}

export async function refreshCache(clinicId: string, year: number, month: number) {
  // Delete existing cache
  await prisma.monthlyAnalyticsCache.deleteMany({
    where: { clinicId, year, month },
  });

  // Recalculate
  return getMonthlyAnalytics(clinicId, year, month);
}

export async function getMonthlyTotal(clinicId: string, year: number, month: number) {
  const analytics = await getMonthlyAnalytics(clinicId, year, month);
  return {
    total: analytics.totalRevenue,
    netProfit: analytics.netProfit,
  };
}
