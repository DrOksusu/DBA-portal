'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// 임시 데이터
const monthlyData = {
  totalIncome: 125000000,
  totalExpense: 45000000,
  netProfit: 80000000,
  previousMonth: {
    totalIncome: 118000000,
    totalExpense: 42000000,
    netProfit: 76000000,
  },
  dailyTrend: [
    { day: 1, income: 4200000, expense: 1500000 },
    { day: 2, income: 5100000, expense: 1800000 },
    { day: 3, income: 3800000, expense: 1200000 },
    { day: 4, income: 0, expense: 500000 }, // 휴무
    { day: 5, income: 4800000, expense: 1600000 },
    // ... more days
  ],
  byCategory: {
    income: [
      { name: '진료비', amount: 95000000, percent: 76 },
      { name: '구강용품', amount: 15000000, percent: 12 },
      { name: '기타', amount: 15000000, percent: 12 },
    ],
    expense: [
      { name: '인건비', amount: 25000000, percent: 55.6 },
      { name: '재료비', amount: 10000000, percent: 22.2 },
      { name: '임대료', amount: 5000000, percent: 11.1 },
      { name: '공과금', amount: 2500000, percent: 5.6 },
      { name: '기타', amount: 2500000, percent: 5.5 },
    ],
  },
};

export default function MonthlyAnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const incomeChange =
    ((monthlyData.totalIncome - monthlyData.previousMonth.totalIncome) /
      monthlyData.previousMonth.totalIncome) *
    100;

  const expenseChange =
    ((monthlyData.totalExpense - monthlyData.previousMonth.totalExpense) /
      monthlyData.previousMonth.totalExpense) *
    100;

  return (
    <>
      <Header title="월별 분석" />

      <div className="p-6 space-y-6">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-lg font-semibold">
                {year}년 {month}월
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Income */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 수입</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(monthlyData.totalIncome)}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-full',
                    incomeChange >= 0 ? 'bg-green-100' : 'bg-red-100'
                  )}
                >
                  {incomeChange >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {incomeChange >= 0 ? '+' : ''}
                  {formatPercent(incomeChange)}
                </span>
                <span className="text-gray-500 ml-1">전월 대비</span>
              </div>
            </div>
          </div>

          {/* Total Expense */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 지출</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(monthlyData.totalExpense)}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-full',
                    expenseChange <= 0 ? 'bg-green-100' : 'bg-red-100'
                  )}
                >
                  {expenseChange <= 0 ? (
                    <TrendingDown className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {expenseChange >= 0 ? '+' : ''}
                  {formatPercent(expenseChange)}
                </span>
                <span className="text-gray-500 ml-1">전월 대비</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="card bg-primary-50 border-primary-200">
            <div className="card-body">
              <p className="text-sm text-primary-600">순이익</p>
              <p className="text-2xl font-bold text-primary-700 mt-1">
                {formatCurrency(monthlyData.netProfit)}
              </p>
              <div className="mt-4 text-sm text-primary-600">
                영업이익률{' '}
                {formatPercent(
                  (monthlyData.netProfit / monthlyData.totalIncome) * 100
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">수입 구성</h3>
            </div>
            <div className="card-body space-y-4">
              {monthlyData.byCategory.income.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium">
                      {formatCurrency(item.amount)} ({formatPercent(item.percent)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense by Category */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">지출 구성</h3>
            </div>
            <div className="card-body space-y-4">
              {monthlyData.byCategory.expense.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium">
                      {formatCurrency(item.amount)} ({formatPercent(item.percent)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Summary Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">일별 요약</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    일자
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    수입
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    지출
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    순이익
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyData.dailyTrend.map((day) => (
                  <tr key={day.day} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {month}월 {day.day}일
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-green-600">
                      {formatCurrency(day.income)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-red-600">
                      {formatCurrency(day.expense)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(day.income - day.expense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
