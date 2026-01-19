'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Plus,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  ShoppingBag,
  MinusCircle,
  Trash2,
} from 'lucide-react';

type ReportType = 'income' | 'expense' | 'oral-sale';

interface DailyEntry {
  id: string;
  type: ReportType;
  description: string;
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
  expenseAmount?: number;
  quantity?: number;
  unitPrice?: number;
  category?: string;
}

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<ReportType>('income');
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  // 임시 폼 상태
  const [formData, setFormData] = useState({
    cashAmount: '',
    cardAmount: '',
    transferAmount: '',
    expenseAmount: '',
    category: '',
    description: '',
    productCode: '',
    quantity: '',
    unitPrice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: DailyEntry = {
      id: Date.now().toString(),
      type: activeTab,
      description: formData.description || getDefaultDescription(),
      ...(activeTab === 'income' && {
        cashAmount: Number(formData.cashAmount) || 0,
        cardAmount: Number(formData.cardAmount) || 0,
        transferAmount: Number(formData.transferAmount) || 0,
      }),
      ...(activeTab === 'expense' && {
        expenseAmount: Number(formData.expenseAmount) || 0,
        category: formData.category,
      }),
      ...(activeTab === 'oral-sale' && {
        quantity: Number(formData.quantity) || 0,
        unitPrice: Number(formData.unitPrice) || 0,
      }),
    };

    setEntries([...entries, newEntry]);
    resetForm();
  };

  const getDefaultDescription = () => {
    switch (activeTab) {
      case 'income':
        return '진료비 수납';
      case 'expense':
        return formData.category || '지출';
      case 'oral-sale':
        return `${formData.productCode || '제품'} 판매`;
    }
  };

  const resetForm = () => {
    setFormData({
      cashAmount: '',
      cardAmount: '',
      transferAmount: '',
      expenseAmount: '',
      category: '',
      description: '',
      productCode: '',
      quantity: '',
      unitPrice: '',
    });
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const getTotalIncome = () => {
    return entries
      .filter((e) => e.type === 'income')
      .reduce(
        (sum, e) => sum + (e.cashAmount || 0) + (e.cardAmount || 0) + (e.transferAmount || 0),
        0
      );
  };

  const getTotalExpense = () => {
    return entries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + (e.expenseAmount || 0), 0);
  };

  const getTotalSales = () => {
    return entries
      .filter((e) => e.type === 'oral-sale')
      .reduce((sum, e) => sum + (e.quantity || 0) * (e.unitPrice || 0), 0);
  };

  return (
    <>
      <Header title="일계표 입력" />

      <div className="p-6 space-y-6">
        {/* Date Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input w-44"
            />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-green-50 border-green-200">
            <div className="card-body">
              <p className="text-sm text-green-600">총 수입</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(getTotalIncome())}
              </p>
            </div>
          </div>
          <div className="card bg-red-50 border-red-200">
            <div className="card-body">
              <p className="text-sm text-red-600">총 지출</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(getTotalExpense())}
              </p>
            </div>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-body">
              <p className="text-sm text-blue-600">구강용품 매출</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(getTotalSales())}
              </p>
            </div>
          </div>
        </div>

        {/* Input Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('income')}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'income'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>수입 입력</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'expense'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="flex items-center space-x-2">
                  <MinusCircle className="h-4 w-4" />
                  <span>지출 입력</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('oral-sale')}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'oral-sale'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>구강용품 판매</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Income Form */}
              {activeTab === 'income' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label flex items-center space-x-2">
                      <Banknote className="h-4 w-4 text-gray-400" />
                      <span>현금</span>
                    </label>
                    <input
                      type="number"
                      value={formData.cashAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, cashAmount: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>카드</span>
                    </label>
                    <input
                      type="number"
                      value={formData.cardAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, cardAmount: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>계좌이체</span>
                    </label>
                    <input
                      type="number"
                      value={formData.transferAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, transferAmount: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Expense Form */}
              {activeTab === 'expense' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="input mt-1"
                    >
                      <option value="">선택</option>
                      <option value="재료비">재료비</option>
                      <option value="인건비">인건비</option>
                      <option value="임대료">임대료</option>
                      <option value="공과금">공과금</option>
                      <option value="마케팅비">마케팅비</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">금액</label>
                    <input
                      type="number"
                      value={formData.expenseAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, expenseAmount: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Oral Sale Form */}
              {activeTab === 'oral-sale' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">제품 코드</label>
                    <input
                      type="text"
                      value={formData.productCode}
                      onChange={(e) =>
                        setFormData({ ...formData, productCode: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="제품 코드"
                    />
                  </div>
                  <div>
                    <label className="label">수량</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">단가</label>
                    <input
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, unitPrice: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="label">메모 (선택)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="메모를 입력하세요"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Entry List */}
        {entries.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">입력 내역</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      구분
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      내용
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      금액
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      삭제
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            entry.type === 'income' && 'bg-green-100 text-green-700',
                            entry.type === 'expense' && 'bg-red-100 text-red-700',
                            entry.type === 'oral-sale' && 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {entry.type === 'income' && '수입'}
                          {entry.type === 'expense' && '지출'}
                          {entry.type === 'oral-sale' && '판매'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        {entry.type === 'income' &&
                          formatCurrency(
                            (entry.cashAmount || 0) +
                              (entry.cardAmount || 0) +
                              (entry.transferAmount || 0)
                          )}
                        {entry.type === 'expense' &&
                          formatCurrency(entry.expenseAmount || 0)}
                        {entry.type === 'oral-sale' &&
                          formatCurrency(
                            (entry.quantity || 0) * (entry.unitPrice || 0)
                          )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn-primary">저장</button>
        </div>
      </div>
    </>
  );
}
