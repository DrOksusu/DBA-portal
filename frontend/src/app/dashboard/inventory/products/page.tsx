'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Building2,
} from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  unitPrice: number;
  minStock: number;
  maxStock: number;
  suppliers: string[];
  isActive: boolean;
}

// 임시 데이터
const productsData: Product[] = [
  {
    id: '1',
    code: 'PRD001',
    name: '일회용 장갑 (M)',
    category: '소모품',
    description: '라텍스 프리 일회용 장갑 (중)',
    unit: '박스',
    unitPrice: 15000,
    minStock: 100,
    maxStock: 1000,
    suppliers: ['의료용품상사', '덴탈플러스'],
    isActive: true,
  },
  {
    id: '2',
    code: 'PRD002',
    name: '마스크 (KF94)',
    category: '소모품',
    description: 'KF94 의료용 마스크',
    unit: '박스',
    unitPrice: 25000,
    minStock: 100,
    maxStock: 500,
    suppliers: ['의료용품상사'],
    isActive: true,
  },
  {
    id: '3',
    code: 'PRD003',
    name: '레진 (A2)',
    category: '재료',
    description: '복합레진 A2 색상',
    unit: '개',
    unitPrice: 120000,
    minStock: 10,
    maxStock: 50,
    suppliers: ['덴탈코리아', '치과재료상사'],
    isActive: true,
  },
  {
    id: '4',
    code: 'PRD004',
    name: '칫솔 (성인용)',
    category: '구강용품',
    description: '부드러운 모 칫솔',
    unit: '개',
    unitPrice: 3000,
    minStock: 50,
    maxStock: 300,
    suppliers: ['구강용품몰'],
    isActive: true,
  },
  {
    id: '5',
    code: 'PRD005',
    name: '치실',
    category: '구강용품',
    description: '왁스 코팅 치실',
    unit: '개',
    unitPrice: 5000,
    minStock: 50,
    maxStock: 200,
    suppliers: ['구강용품몰', '덴탈플러스'],
    isActive: true,
  },
];

const categories = ['소모품', '재료', '구강용품', '기타'];

export default function ProductsPage() {
  const [products] = useState<Product[]>(productsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.includes(searchTerm) || product.code.includes(searchTerm);
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Header title="품목 관리" />

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
          {categories.slice(0, 3).map((cat) => (
            <div key={cat} className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">{cat}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.category === cat).length}개
                </p>
              </div>
            </div>
          ))}
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
                placeholder="품목명, 코드 검색..."
                className="input pl-10 w-full md:w-64"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-full md:w-40"
            >
              <option value="">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            품목 등록
          </button>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    품목명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    단위
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    단가
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    재고 범위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    공급업체
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{product.code}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-500">{product.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.unit}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(product.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {product.minStock} ~ {product.maxStock}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.suppliers.map((supplier, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            {supplier}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openModal(product)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            />
            <div className="relative bg-white rounded-lg max-w-2xl w-full mx-auto shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProduct ? '품목 정보 수정' : '새 품목 등록'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">품목 코드</label>
                    <input
                      type="text"
                      defaultValue={selectedProduct?.code}
                      className="input mt-1"
                      placeholder="PRD001"
                    />
                  </div>
                  <div>
                    <label className="label">품목명</label>
                    <input
                      type="text"
                      defaultValue={selectedProduct?.name}
                      className="input mt-1"
                      placeholder="품목명을 입력하세요"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">카테고리</label>
                    <select
                      defaultValue={selectedProduct?.category}
                      className="input mt-1"
                    >
                      <option value="">선택</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">단위</label>
                    <input
                      type="text"
                      defaultValue={selectedProduct?.unit}
                      className="input mt-1"
                      placeholder="박스, 개, EA 등"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">설명</label>
                  <textarea
                    defaultValue={selectedProduct?.description}
                    className="input mt-1"
                    rows={2}
                    placeholder="품목에 대한 설명을 입력하세요"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">단가</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct?.unitPrice}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">최소 재고</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct?.minStock}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">최대 재고</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct?.maxStock}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedProduct ? '수정' : '등록'}
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
