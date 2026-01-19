'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  Calendar,
  Target,
  TrendingUp,
  X,
  Play,
  Pause,
  CheckCircle,
} from 'lucide-react';

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
type CampaignType = 'SNS' | 'SEARCH' | 'OFFLINE' | 'EMAIL' | 'EVENT';

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetPatients: number;
  actualPatients: number;
  revenue: number;
}

// 임시 데이터
const campaignsData: Campaign[] = [
  {
    id: '1',
    name: '신년 임플란트 할인 이벤트',
    type: 'EVENT',
    status: 'ACTIVE',
    budget: 5000000,
    spent: 3200000,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    targetPatients: 50,
    actualPatients: 35,
    revenue: 45000000,
  },
  {
    id: '2',
    name: '네이버 검색광고',
    type: 'SEARCH',
    status: 'ACTIVE',
    budget: 2000000,
    spent: 1800000,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    targetPatients: 30,
    actualPatients: 28,
    revenue: 18000000,
  },
  {
    id: '3',
    name: '인스타그램 프로모션',
    type: 'SNS',
    status: 'PAUSED',
    budget: 1500000,
    spent: 800000,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    targetPatients: 20,
    actualPatients: 12,
    revenue: 8500000,
  },
  {
    id: '4',
    name: '지역 전단지 배포',
    type: 'OFFLINE',
    status: 'COMPLETED',
    budget: 500000,
    spent: 500000,
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    targetPatients: 15,
    actualPatients: 18,
    revenue: 12000000,
  },
];

const statusLabels: Record<CampaignStatus, string> = {
  DRAFT: '준비중',
  ACTIVE: '진행중',
  PAUSED: '일시중지',
  COMPLETED: '완료',
};

const statusColors: Record<CampaignStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

const typeLabels: Record<CampaignType, string> = {
  SNS: 'SNS',
  SEARCH: '검색광고',
  OFFLINE: '오프라인',
  EMAIL: '이메일',
  EVENT: '이벤트',
};

const typeColors: Record<CampaignType, string> = {
  SNS: 'bg-pink-100 text-pink-700',
  SEARCH: 'bg-blue-100 text-blue-700',
  OFFLINE: 'bg-orange-100 text-orange-700',
  EMAIL: 'bg-purple-100 text-purple-700',
  EVENT: 'bg-green-100 text-green-700',
};

export default function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>(campaignsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.includes(searchTerm);
    const matchesStatus = statusFilter === '' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

  const openModal = (campaign?: Campaign) => {
    setSelectedCampaign(campaign || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Header title="마케팅 캠페인" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">총 예산</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalBudget)}
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
                  <p className="text-sm text-gray-500">총 집행액</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Megaphone className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  예산 대비 {formatPercent((totalSpent / totalBudget) * 100)} 집행
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">캠페인 매출</p>
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
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 ROI</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  totalROI >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {totalROI >= 0 ? '+' : ''}
                {formatPercent(totalROI)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                순이익 {formatCurrency(totalRevenue - totalSpent)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="캠페인 검색..."
                className="input pl-10 w-full md:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
              className="input w-full md:w-40"
            >
              <option value="">전체 상태</option>
              <option value="DRAFT">준비중</option>
              <option value="ACTIVE">진행중</option>
              <option value="PAUSED">일시중지</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            캠페인 등록
          </button>
        </div>

        {/* Campaigns Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    캠페인
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    유형
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    기간
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    예산/집행
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    목표/실제
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    매출
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.map((campaign) => {
                  const roi =
                    campaign.spent > 0
                      ? ((campaign.revenue - campaign.spent) / campaign.spent) * 100
                      : 0;
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            typeColors[campaign.type]
                          )}
                        >
                          {typeLabels[campaign.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            statusColors[campaign.status]
                          )}
                        >
                          {statusLabels[campaign.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(campaign.startDate)} ~{' '}
                            {formatDate(campaign.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(campaign.spent)} /{' '}
                          {formatCurrency(campaign.budget)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                (campaign.spent / campaign.budget) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span
                          className={cn(
                            campaign.actualPatients >= campaign.targetPatients
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          )}
                        >
                          {campaign.actualPatients} / {campaign.targetPatients}명
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(campaign.revenue)}
                        </div>
                        <div
                          className={cn(
                            'text-xs',
                            roi >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          ROI {roi >= 0 ? '+' : ''}
                          {formatPercent(roi)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {campaign.status === 'ACTIVE' && (
                            <button
                              className="p-1 text-gray-400 hover:text-yellow-600"
                              title="일시중지"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          )}
                          {campaign.status === 'PAUSED' && (
                            <button
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="재개"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openModal(campaign)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                            title="수정"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            />
            <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCampaign ? '캠페인 수정' : '새 캠페인 등록'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div>
                  <label className="label">캠페인명</label>
                  <input
                    type="text"
                    defaultValue={selectedCampaign?.name}
                    className="input mt-1"
                    placeholder="캠페인명을 입력하세요"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">유형</label>
                    <select
                      defaultValue={selectedCampaign?.type}
                      className="input mt-1"
                    >
                      <option value="">선택</option>
                      <option value="SNS">SNS</option>
                      <option value="SEARCH">검색광고</option>
                      <option value="OFFLINE">오프라인</option>
                      <option value="EMAIL">이메일</option>
                      <option value="EVENT">이벤트</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">예산</label>
                    <input
                      type="number"
                      defaultValue={selectedCampaign?.budget}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">시작일</label>
                    <input
                      type="date"
                      defaultValue={selectedCampaign?.startDate}
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="label">종료일</label>
                    <input
                      type="date"
                      defaultValue={selectedCampaign?.endDate}
                      className="input mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">목표 환자 수</label>
                  <input
                    type="number"
                    defaultValue={selectedCampaign?.targetPatients}
                    className="input mt-1"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedCampaign ? '수정' : '등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
