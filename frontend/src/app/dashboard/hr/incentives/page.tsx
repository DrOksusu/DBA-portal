'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
  Award,
  Settings,
  Plus,
} from 'lucide-react';

type PolicyType = 'PERCENTAGE' | 'FIXED' | 'TIERED';

interface TargetRevenue {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  targetAmount: number;
  achievedAmount: number;
  achievementRate: number;
}

interface IncentivePolicy {
  id: string;
  name: string;
  policyType: PolicyType;
  value: number;
  tiers?: { min: number; max: number; rate: number }[];
  isDefault: boolean;
}

// 임시 데이터
const targetData: TargetRevenue[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: '김영희',
    position: '원장',
    targetAmount: 50000000,
    achievedAmount: 52500000,
    achievementRate: 105,
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: '이철수',
    position: '치과의사',
    targetAmount: 35000000,
    achievedAmount: 33250000,
    achievementRate: 95,
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: '박미정',
    position: '치위생사',
    targetAmount: 8000000,
    achievedAmount: 8800000,
    achievementRate: 110,
  },
];

const policies: IncentivePolicy[] = [
  {
    id: '1',
    name: '기본 인센티브',
    policyType: 'PERCENTAGE',
    value: 5,
    isDefault: true,
  },
  {
    id: '2',
    name: '원장 인센티브',
    policyType: 'TIERED',
    value: 0,
    tiers: [
      { min: 0, max: 100, rate: 3 },
      { min: 100, max: 110, rate: 5 },
      { min: 110, max: 999, rate: 8 },
    ],
    isDefault: false,
  },
  {
    id: '3',
    name: '고정 보너스',
    policyType: 'FIXED',
    value: 500000,
    isDefault: false,
  },
];

const policyTypeLabels: Record<PolicyType, string> = {
  PERCENTAGE: '비율',
  FIXED: '고정',
  TIERED: '단계별',
};

export default function IncentivesPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState<'targets' | 'policies'>('targets');

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

  const totalTarget = targetData.reduce((sum, t) => sum + t.targetAmount, 0);
  const totalAchieved = targetData.reduce((sum, t) => sum + t.achievedAmount, 0);
  const overallRate = (totalAchieved / totalTarget) * 100;

  return (
    <>
      <Header title="인센티브 관리" />

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 목표 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalTarget)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 달성 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalAchieved)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">전체 달성률</p>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      overallRate >= 100 ? 'text-green-600' : 'text-yellow-600'
                    )}
                  >
                    {formatPercent(overallRate)}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-full',
                    overallRate >= 100 ? 'bg-green-100' : 'bg-yellow-100'
                  )}
                >
                  <Award
                    className={cn(
                      'h-6 w-6',
                      overallRate >= 100 ? 'text-green-600' : 'text-yellow-600'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">목표 초과 직원</p>
              <p className="text-2xl font-bold text-primary-600">
                {targetData.filter((t) => t.achievementRate >= 100).length}명
              </p>
              <p className="text-xs text-gray-400 mt-1">
                / 전체 {targetData.length}명
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('targets')}
              className={cn(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'targets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>목표 달성 현황</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={cn(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'policies'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>인센티브 정책</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Target Achievement Tab */}
        {activeTab === 'targets' && (
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">직원별 목표 달성 현황</h3>
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                목표 설정
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      직원
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      목표 매출
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      달성 매출
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      달성률
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      진행 상황
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      예상 인센티브
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {targetData.map((target) => {
                    const isAchieved = target.achievementRate >= 100;
                    const incentive = isAchieved
                      ? Math.round(target.achievedAmount * 0.05)
                      : 0;
                    return (
                      <tr key={target.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {target.employeeName}
                          </div>
                          <div className="text-xs text-gray-500">{target.position}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          {formatCurrency(target.targetAmount)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          {formatCurrency(target.achievedAmount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              isAchieved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            )}
                          >
                            {formatPercent(target.achievementRate)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                isAchieved ? 'bg-green-500' : 'bg-yellow-500'
                              )}
                              style={{
                                width: `${Math.min(target.achievementRate, 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                          {formatCurrency(incentive)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                정책 추가
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className={cn(
                    'card',
                    policy.isDefault && 'border-primary-300 bg-primary-50'
                  )}
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {policy.name}
                      </h4>
                      {policy.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                          기본
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">유형</span>
                        <span className="font-medium">
                          {policyTypeLabels[policy.policyType]}
                        </span>
                      </div>
                      {policy.policyType === 'PERCENTAGE' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">비율</span>
                          <span className="font-medium text-green-600">
                            달성 매출의 {policy.value}%
                          </span>
                        </div>
                      )}
                      {policy.policyType === 'FIXED' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">금액</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(policy.value)}
                          </span>
                        </div>
                      )}
                      {policy.policyType === 'TIERED' && policy.tiers && (
                        <div className="space-y-2">
                          <span className="text-sm text-gray-500">단계별 비율</span>
                          {policy.tiers.map((tier, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs bg-gray-100 p-2 rounded"
                            >
                              <span>
                                {tier.min}% ~ {tier.max === 999 ? '∞' : `${tier.max}%`}
                              </span>
                              <span className="font-medium text-green-600">
                                {tier.rate}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        수정
                      </button>
                      {!policy.isDefault && (
                        <button className="text-sm text-red-500 hover:text-red-700">
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
