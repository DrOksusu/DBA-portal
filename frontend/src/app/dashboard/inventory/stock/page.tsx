'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Package,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

type StockStatus = 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  status: StockStatus;
}

interface StockMovement {
  id: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: string;
  date: string;
}

// 임시 데이터
const productsData: Product[] = [
  {
    id: '1',
    code: 'PRD001',
    name: '일회용 장갑 (M)',
    category: '소모품',
    currentStock: 500,
    minStock: 100,
    maxStock: 1000,
    unit: '박스',
    unitPrice: 15000,
    status: 'NORMAL',
  },
  {
    id: '2',
    code: 'PRD002',
    name: '마스크 (KF94)',
    category: '소모품',
    currentStock: 80,
    minStock: 100,
    maxStock: 500,
    unit: '박스',
    unitPrice: 25000,
    status: 'LOW',
  },
  {
    id: '3',
    code: 'PRD003',
    name: '레진 (A2)',
    category: '재료',
    currentStock: 0,
    minStock: 10,
    maxStock: 50,
    unit: '개',
    unitPrice: 120000,
    status: 'OUT_OF_STOCK',
  },
  {
    id: '4',
    code: 'PRD004',
    name: '칫솔 (성인용)',
    category: '구강용품',
    currentStock: 200,
    minStock: 50,
    maxStock: 300,
    unit: '개',
    unitPrice: 3000,
    status: 'NORMAL',
  },
  {
    id: '5',
    code: 'PRD005',
    name: '치실',
    category: '구강용품',
    currentStock: 45,
    minStock: 50,
    maxStock: 200,
    unit: '개',
    unitPrice: 5000,
    status: 'LOW',
  },
];

const recentMovements: StockMovement[] = [
  {
    id: '1',
    productName: '일회용 장갑 (M)',
    type: 'IN',
    quantity: 100,
    reason: '정기 입고',
    date: '2024-01-15',
  },
  {
    id: '2',
    productName: '마스크 (KF94)',
    type: 'OUT',
    quantity: 20,
    reason: '진료 사용',
    date: '2024-01-15',
  },
  {
    id: '3',
    productName: '레진 (A2)',
    type: 'OUT',
    quantity: 10,
    reason: '진료 사용',
    date: '2024-01-14',
  },
  {
    id: '4',
    productName: '칫솔 (성인용)',
    type: 'ADJUSTMENT',
    quantity: -5,
    reason: '재고 실사 조정',
    date: '2024-01-13',
  },
];

const statusLabels: Record<StockStatus, string> = {
  NORMAL: '정상',
  LOW: '부족',
  OUT_OF_STOCK: '품절',
};

const statusColors: Record<StockStatus, string> = {
  NORMAL: 'bg-green-100 text-green-700',
  LOW: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

const movementTypeLabels: Record<MovementType, string> = {
  IN: '입고',
  OUT: '출고',
  ADJUSTMENT: '조정',
};

const movementTypeColors: Record<MovementType, string> = {
  IN: 'text-green-600',
  OUT: 'text-red-600',
  ADJUSTMENT: 'text-blue-600',
};

export default function StockPage() {
  const [products] = useState<Product[]>(productsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | ''>('');

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchTerm) || product.code.includes(searchTerm);
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesStatus = statusFilter === '' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  const totalValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.unitPrice,
    0
  );

  return (
    <>
      <Header title="재고 현황" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">전체 품목</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}개</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">재고 부족</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter((p) => p.status === 'LOW').length}개
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">품절</p>
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter((p) => p.status === 'OUT_OF_STOCK').length}개
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 재고 가치</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(totalValue)}
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
                placeholder="제품명, 코드 검색..."
                className="input pl-10 w-full md:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input pl-10 w-full md:w-40"
              >
                <option value="">전체 카테고리</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StockStatus | '')}
              className="input w-full md:w-32"
            >
              <option value="">전체 상태</option>
              <option value="NORMAL">정상</option>
              <option value="LOW">부족</option>
              <option value="OUT_OF_STOCK">품절</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              재고 실사
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              입/출고
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Table */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">재고 목록</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      코드
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      품목명
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      카테고리
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      현재고
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      상태
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      단가
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500">{product.code}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatNumber(product.currentStock)} {product.unit}
                        </div>
                        <div className="text-xs text-gray-400">
                          최소 {product.minStock} / 최대 {product.maxStock}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            statusColors[product.status]
                          )}
                        >
                          {statusLabels[product.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(product.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">최근 입출고</h3>
            </div>
            <div className="card-body p-0">
              <div className="divide-y divide-gray-100">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            movement.type === 'IN' && 'bg-green-100',
                            movement.type === 'OUT' && 'bg-red-100',
                            movement.type === 'ADJUSTMENT' && 'bg-blue-100'
                          )}
                        >
                          {movement.type === 'IN' && (
                            <ArrowDown className="h-4 w-4 text-green-600" />
                          )}
                          {movement.type === 'OUT' && (
                            <ArrowUp className="h-4 w-4 text-red-600" />
                          )}
                          {movement.type === 'ADJUSTMENT' && (
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {movement.productName}
                          </p>
                          <p className="text-xs text-gray-500">{movement.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            movementTypeColors[movement.type]
                          )}
                        >
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
                          {Math.abs(movement.quantity)}
                        </p>
                        <p className="text-xs text-gray-400">{movement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
