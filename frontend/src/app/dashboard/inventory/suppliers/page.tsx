'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productCount: number;
  totalOrders: number;
  isActive: boolean;
}

// 임시 데이터
const suppliersData: Supplier[] = [
  {
    id: '1',
    name: '의료용품상사',
    contactPerson: '김상사',
    phone: '02-1234-5678',
    email: 'contact@medical.co.kr',
    address: '서울시 강남구 테헤란로 123',
    productCount: 25,
    totalOrders: 150,
    isActive: true,
  },
  {
    id: '2',
    name: '덴탈플러스',
    contactPerson: '이플러스',
    phone: '02-2345-6789',
    email: 'info@dentalplus.com',
    address: '서울시 서초구 서초대로 456',
    productCount: 18,
    totalOrders: 89,
    isActive: true,
  },
  {
    id: '3',
    name: '덴탈코리아',
    contactPerson: '박코리아',
    phone: '02-3456-7890',
    email: 'sales@dentalkorea.com',
    address: '경기도 성남시 분당구 판교로 789',
    productCount: 12,
    totalOrders: 45,
    isActive: true,
  },
  {
    id: '4',
    name: '치과재료상사',
    contactPerson: '최재료',
    phone: '02-4567-8901',
    email: 'order@dentalmaterial.kr',
    address: '서울시 송파구 올림픽로 321',
    productCount: 30,
    totalOrders: 200,
    isActive: true,
  },
  {
    id: '5',
    name: '구강용품몰',
    contactPerson: '정구강',
    phone: '02-5678-9012',
    email: 'cs@oralcare.co.kr',
    address: '서울시 마포구 마포대로 654',
    productCount: 15,
    totalOrders: 78,
    isActive: true,
  },
];

export default function SuppliersPage() {
  const [suppliers] = useState<Supplier[]>(suppliersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.includes(searchTerm) || supplier.contactPerson.includes(searchTerm)
  );

  const openModal = (supplier?: Supplier) => {
    setSelectedSupplier(supplier || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSupplier(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Header title="공급업체 관리" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">전체 공급업체</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}개</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 취급 품목</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.reduce((sum, s) => sum + s.productCount, 0)}개
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 주문 건수</p>
              <p className="text-2xl font-bold text-primary-600">
                {suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}건
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="업체명, 담당자 검색..."
              className="input pl-10 w-full md:w-64"
            />
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            공급업체 등록
          </button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                      <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openModal(supplier)}
                      className="p-1 text-gray-400 hover:text-primary-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {supplier.phone}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {supplier.email}
                  </div>
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    {supplier.address}
                  </div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {supplier.productCount}
                    </p>
                    <p className="text-xs text-gray-500">취급 품목</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-primary-600">
                      {supplier.totalOrders}
                    </p>
                    <p className="text-xs text-gray-500">주문 건수</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Modal */}
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
                  {selectedSupplier ? '공급업체 정보 수정' : '새 공급업체 등록'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div>
                  <label className="label">업체명</label>
                  <input
                    type="text"
                    defaultValue={selectedSupplier?.name}
                    className="input mt-1"
                    placeholder="업체명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="label">담당자</label>
                  <input
                    type="text"
                    defaultValue={selectedSupplier?.contactPerson}
                    className="input mt-1"
                    placeholder="담당자 이름"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">전화번호</label>
                    <input
                      type="tel"
                      defaultValue={selectedSupplier?.phone}
                      className="input mt-1"
                      placeholder="02-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="label">이메일</label>
                    <input
                      type="email"
                      defaultValue={selectedSupplier?.email}
                      className="input mt-1"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">주소</label>
                  <input
                    type="text"
                    defaultValue={selectedSupplier?.address}
                    className="input mt-1"
                    placeholder="주소를 입력하세요"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedSupplier ? '수정' : '등록'}
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
