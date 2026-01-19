'use client';

import { useAuthStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// 임시 데이터 (실제로는 API에서 가져옴)
const statsData = {
  revenue: {
    current: 125000000,
    previous: 118000000,
    change: 5.9,
  },
  patients: {
    current: 342,
    previous: 320,
    change: 6.9,
  },
  employees: {
    total: 12,
    active: 11,
  },
  inventory: {
    total: 45,
    lowStock: 3,
  },
};

const recentActivities = [
  { id: 1, type: 'income', description: '진료비 수납', amount: 850000, time: '10분 전' },
  { id: 2, type: 'expense', description: '재료비 지출', amount: -120000, time: '30분 전' },
  { id: 3, type: 'income', description: '카드 수납', amount: 1200000, time: '1시간 전' },
  { id: 4, type: 'sale', description: '칫솔 세트 판매', amount: 35000, time: '2시간 전' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <>
      <Header title="대시보드" />

      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold">안녕하세요, {user?.name}님!</h2>
          <p className="mt-1 text-primary-100">
            오늘도 VIBE와 함께 효율적인 경영 관리를 시작하세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">이번 달 매출</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(statsData.revenue.current)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {statsData.revenue.change > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    statsData.revenue.change > 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {formatPercent(Math.abs(statsData.revenue.change))}
                </span>
                <span className="text-gray-500 ml-1">전월 대비</span>
              </div>
            </div>
          </div>

          {/* Patients */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">이번 달 환자 수</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(statsData.patients.current)}명
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">
                  {formatPercent(statsData.patients.change)}
                </span>
                <span className="text-gray-500 ml-1">전월 대비</span>
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">재직 직원</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statsData.employees.active}명
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                전체 {statsData.employees.total}명
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">재고 품목</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statsData.inventory.total}개
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 text-sm">
                {statsData.inventory.lowStock > 0 && (
                  <span className="text-red-600">
                    재고 부족 {statsData.inventory.lowStock}개
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            </div>
            <div className="card-body p-0">
              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {activity.amount > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {activity.amount > 0 ? '+' : ''}
                      {formatCurrency(activity.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">빠른 메뉴</h3>
            </div>
            <div className="card-body space-y-3">
              <a
                href="/dashboard/revenue/daily"
                className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900">일계표 입력</span>
                </div>
              </a>
              <a
                href="/dashboard/hr/employees"
                className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900">직원 관리</span>
                </div>
              </a>
              <a
                href="/dashboard/inventory/stock"
                className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900">재고 현황</span>
                </div>
              </a>
              <a
                href="/dashboard/marketing/campaigns"
                className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Megaphone className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900">마케팅 캠페인</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
