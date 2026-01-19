import { prisma } from '../server';
import { ExpenseType, MarketingChannel, Prisma } from '@prisma/client';
import * as campaignService from './campaign.service';

export interface CreateExpenseData {
  clinicId: string;
  campaignId?: string;
  type: ExpenseType;
  channel?: MarketingChannel;
  description: string;
  amount: number;
  expenseDate: Date;
  receiptNo?: string;
  vendor?: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateExpenseData {
  type?: ExpenseType;
  channel?: MarketingChannel;
  description?: string;
  amount?: number;
  expenseDate?: Date;
  receiptNo?: string;
  vendor?: string;
  notes?: string;
}

export interface ExpenseFilter {
  clinicId: string;
  campaignId?: string;
  type?: ExpenseType;
  channel?: MarketingChannel;
  startDate?: Date;
  endDate?: Date;
}

// 비용 목록 조회
export const getExpenses = async (filter: ExpenseFilter, page = 1, limit = 50) => {
  const where: Prisma.MarketingExpenseWhereInput = {
    clinicId: filter.clinicId,
  };

  if (filter.campaignId) {
    where.campaignId = filter.campaignId;
  }

  if (filter.type) {
    where.type = filter.type;
  }

  if (filter.channel) {
    where.channel = filter.channel;
  }

  if (filter.startDate || filter.endDate) {
    where.expenseDate = {};
    if (filter.startDate) {
      where.expenseDate.gte = filter.startDate;
    }
    if (filter.endDate) {
      where.expenseDate.lte = filter.endDate;
    }
  }

  const [expenses, total] = await Promise.all([
    prisma.marketingExpense.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { expenseDate: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.marketingExpense.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 비용 상세 조회
export const getExpense = async (clinicId: string, expenseId: string) => {
  return prisma.marketingExpense.findFirst({
    where: {
      id: expenseId,
      clinicId,
    },
    include: {
      campaign: true,
    },
  });
};

// 비용 등록
export const createExpense = async (data: CreateExpenseData) => {
  const expense = await prisma.marketingExpense.create({
    data: {
      clinicId: data.clinicId,
      campaignId: data.campaignId,
      type: data.type,
      channel: data.channel,
      description: data.description,
      amount: data.amount,
      expenseDate: data.expenseDate,
      receiptNo: data.receiptNo,
      vendor: data.vendor,
      notes: data.notes,
      createdBy: data.createdBy,
    },
  });

  // 캠페인 지출액 업데이트
  if (data.campaignId) {
    await campaignService.updateCampaignSpent(data.campaignId);
  }

  return expense;
};

// 비용 수정
export const updateExpense = async (
  clinicId: string,
  expenseId: string,
  data: UpdateExpenseData
) => {
  const existing = await prisma.marketingExpense.findFirst({
    where: { id: expenseId, clinicId },
  });

  if (!existing) {
    return null;
  }

  const expense = await prisma.marketingExpense.update({
    where: { id: expenseId },
    data,
  });

  // 캠페인 지출액 업데이트
  if (existing.campaignId) {
    await campaignService.updateCampaignSpent(existing.campaignId);
  }

  return expense;
};

// 비용 삭제
export const deleteExpense = async (clinicId: string, expenseId: string) => {
  const existing = await prisma.marketingExpense.findFirst({
    where: { id: expenseId, clinicId },
  });

  if (!existing) {
    return null;
  }

  const expense = await prisma.marketingExpense.delete({
    where: { id: expenseId },
  });

  // 캠페인 지출액 업데이트
  if (existing.campaignId) {
    await campaignService.updateCampaignSpent(existing.campaignId);
  }

  return expense;
};

// 월별 비용 합계
export const getMonthlyExpenseTotal = async (
  clinicId: string,
  year: number,
  month: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const expenses = await prisma.marketingExpense.findMany({
    where: {
      clinicId,
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byType: Record<string, number> = {};
  const byChannel: Record<string, number> = {};

  for (const expense of expenses) {
    byType[expense.type] = (byType[expense.type] || 0) + expense.amount;
    if (expense.channel) {
      byChannel[expense.channel] = (byChannel[expense.channel] || 0) + expense.amount;
    }
  }

  return {
    total,
    byType,
    byChannel,
    count: expenses.length,
  };
};

// 연간 비용 추이
export const getYearlyExpenseTrend = async (clinicId: string, year: number) => {
  const expenses = await prisma.marketingExpense.findMany({
    where: {
      clinicId,
      expenseDate: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59, 59),
      },
    },
  });

  const monthlyTotals: Record<number, { total: number; count: number }> = {};

  for (let m = 1; m <= 12; m++) {
    monthlyTotals[m] = { total: 0, count: 0 };
  }

  for (const expense of expenses) {
    const month = expense.expenseDate.getMonth() + 1;
    monthlyTotals[month].total += expense.amount;
    monthlyTotals[month].count++;
  }

  return Object.entries(monthlyTotals).map(([month, data]) => ({
    month: parseInt(month),
    ...data,
  }));
};
