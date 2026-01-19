'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  BarChart3,
} from 'lucide-react';

interface ChannelData {
  channel: string;
  patients: number;
  revenue: number;
  cost: number;
  roi: number;
  conversion: number;
}

interface MonthlyTrend {
  month: string;
  marketingCost: number;
  newPatients: number;
  revenue: number;
}

// 임시 데이터
const channelData: ChannelData[] = [
  {
    channel: '네이버 검색',
    patients: 45,
    revenue: 32000000,
    cost: 2500000,
    roi: 1180,
    conversion: 4.2,
  },
  {
    channel: '인스타그램',
    patients: 28,
    revenue: 18500000,
    cost: 1200000,
    roi: 1442,
    conversion: 3.8,
  },
  {
    channel: '소개/추천',
    patients: 52,
    revenue: 42000000,
    cost: 0,
    roi: 0,
    conversion: 0,
  },
  {
    channel: '지역 전단',
    patients: 12,
    revenue: 8500000,
    cost: 500000,
    roi: 1600,
    conversion: 2.1,
  },
  {
    channel: '카카오 광고',
    patients: 18,
    revenue: 12000000,
    cost: 800000,
    roi: 1400,
    conversion: 3.2,
  },
  {
    channel: '기타',
    patients: 15,
    revenue: 9000000,
    cost: 200000,
    roi: 4400,
    conversion: 1.5,
  },
];

const monthlyTrend: MonthlyTrend[] = [
  { month: '2023-08', marketingCost: 4000000, newPatients: 120, revenue: 85000000 },
  { month: '2023-09', marketingCost: 4500000, newPatients: 135, revenue: 92000000 },
  { month: '2023-10', marketingCost: 5000000, newPatients: 145, revenue: 98000000 },
  { month: '2023-11', marketingCost: 4800000, newPatients: 142, revenue: 105000000 },
  { month: '2023-12', marketingCost: 5500000, newPatients: 158, revenue: 118000000 },
  { month: '2024-01', marketingCost: 5200000, newPatients: 170, revenue: 122000000 },
];

export default function MarketingAnalyticsPage() {
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

  const totalPatients = channelData.reduce((sum, c) => sum + c.patients, 0);
  const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = channelData.reduce((sum, c) => sum + c.cost, 0);
  const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  const avgCPA = totalCost / (totalPatients - channelData.find((c) => c.channel === '소개/추천')?.patients || 0);

  return (
    <>
      <Header title="마케팅 분석" />

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
                {year}년 {month}월 분석
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">신규 환자</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPatients}명</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12.5% 전월 대비</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">마케팅 비용</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                환자당 {formatCurrency(Math.round(avgCPA))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">마케팅 매출</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-primary-50 border-primary-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">전체 ROI</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {formatPercent(overallROI)}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-primary-600">
                투자 대비 {(overallROI / 100 + 1).toFixed(1)}배 수익
              </div>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">채널별 성과</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    채널
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    신규 환자
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    매출
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    비용
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    점유율
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {channelData.map((channel) => {
                  const sharePercent = (channel.patients / totalPatients) * 100;
                  return (
                    <tr key={channel.channel} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {channel.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {channel.patients}명
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-green-600 font-medium">
                        {formatCurrency(channel.revenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {channel.cost > 0 ? formatCurrency(channel.cost) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {channel.cost > 0 ? (
                          <span
                            className={cn(
                              'text-sm font-medium',
                              channel.roi >= 1000 ? 'text-green-600' : 'text-yellow-600'
                            )}
                          >
                            {formatPercent(channel.roi)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${sharePercent}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-12">
                            {formatPercent(sharePercent)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">월별 추이</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-6 gap-4">
              {monthlyTrend.map((data, index) => {
                const [year, month] = data.month.split('-');
                const prevData = index > 0 ? monthlyTrend[index - 1] : null;
                const patientGrowth = prevData
                  ? ((data.newPatients - prevData.newPatients) / prevData.newPatients) *
                    100
                  : 0;
                return (
                  <div
                    key={data.month}
                    className={cn(
                      'p-4 rounded-lg border',
                      index === monthlyTrend.length - 1
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <p className="text-sm font-medium text-gray-500 mb-3">
                      {year}년 {parseInt(month)}월
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-400">신규 환자</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold text-gray-900">
                            {data.newPatients}명
                          </p>
                          {prevData && (
                            <span
                              className={cn(
                                'text-xs',
                                patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              {patientGrowth >= 0 ? '+' : ''}
                              {patientGrowth.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">마케팅 비용</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatCurrency(data.marketingCost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">매출</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(data.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
