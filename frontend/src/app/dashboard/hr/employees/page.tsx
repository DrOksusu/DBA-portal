'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  X,
} from 'lucide-react';

type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';

interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  baseSalary: number;
}

// 임시 데이터
const employeesData: Employee[] = [
  {
    id: '1',
    employeeNumber: 'EMP001',
    name: '김영희',
    position: '원장',
    department: '진료',
    email: 'kim@clinic.com',
    phone: '010-1234-5678',
    hireDate: '2020-03-15',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 8000000,
  },
  {
    id: '2',
    employeeNumber: 'EMP002',
    name: '이철수',
    position: '치과의사',
    department: '진료',
    email: 'lee@clinic.com',
    phone: '010-2345-6789',
    hireDate: '2021-06-01',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 6000000,
  },
  {
    id: '3',
    employeeNumber: 'EMP003',
    name: '박미정',
    position: '치위생사',
    department: '진료지원',
    email: 'park@clinic.com',
    phone: '010-3456-7890',
    hireDate: '2022-01-10',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 3200000,
  },
  {
    id: '4',
    employeeNumber: 'EMP004',
    name: '정수진',
    position: '간호조무사',
    department: '진료지원',
    email: 'jung@clinic.com',
    phone: '010-4567-8901',
    hireDate: '2022-08-20',
    status: 'ON_LEAVE',
    employmentType: 'FULL_TIME',
    baseSalary: 2800000,
  },
  {
    id: '5',
    employeeNumber: 'EMP005',
    name: '최민호',
    position: '데스크',
    department: '행정',
    email: 'choi@clinic.com',
    phone: '010-5678-9012',
    hireDate: '2023-02-01',
    status: 'ACTIVE',
    employmentType: 'PART_TIME',
    baseSalary: 1800000,
  },
];

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: '재직',
  ON_LEAVE: '휴직',
  RESIGNED: '퇴직',
};

const statusColors: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  RESIGNED: 'bg-gray-100 text-gray-700',
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  PART_TIME: '파트타임',
  CONTRACT: '계약직',
};

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>(employeesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.includes(searchTerm) ||
      emp.employeeNumber.includes(searchTerm) ||
      emp.position.includes(searchTerm);
    const matchesStatus = statusFilter === '' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (employee?: Employee) => {
    setSelectedEmployee(employee || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Header title="직원 관리" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">전체 직원</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}명</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">재직 중</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter((e) => e.status === 'ACTIVE').length}명
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">휴직 중</p>
              <p className="text-2xl font-bold text-yellow-600">
                {employees.filter((e) => e.status === 'ON_LEAVE').length}명
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">이번 달 인건비</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(
                  employees
                    .filter((e) => e.status === 'ACTIVE')
                    .reduce((sum, e) => sum + e.baseSalary, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름, 사번, 직책 검색..."
                className="input pl-10 w-full md:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | '')}
                className="input pl-10 w-full md:w-40"
              >
                <option value="">전체 상태</option>
                <option value="ACTIVE">재직</option>
                <option value="ON_LEAVE">휴직</option>
                <option value="RESIGNED">퇴직</option>
              </select>
            </div>
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            직원 등록
          </button>
        </div>

        {/* Employee List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    사번
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    직책/부서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    입사일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    고용형태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    기본급
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {employee.employeeNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                      <div className="text-xs text-gray-500">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {employee.phone}
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(employee.hireDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {employmentTypeLabels[employee.employmentType]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          statusColors[employee.status]
                        )}
                      >
                        {statusLabels[employee.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(employee.baseSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openModal(employee)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {employee.status === 'ACTIVE' ? (
                          <button
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title="휴직 처리"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : employee.status === 'ON_LEAVE' ? (
                          <button
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="복직 처리"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : null}
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

      {/* Employee Modal */}
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
                  {selectedEmployee ? '직원 정보 수정' : '새 직원 등록'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">사번</label>
                    <input
                      type="text"
                      defaultValue={selectedEmployee?.employeeNumber}
                      className="input mt-1"
                      placeholder="EMP001"
                    />
                  </div>
                  <div>
                    <label className="label">이름</label>
                    <input
                      type="text"
                      defaultValue={selectedEmployee?.name}
                      className="input mt-1"
                      placeholder="홍길동"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">직책</label>
                    <input
                      type="text"
                      defaultValue={selectedEmployee?.position}
                      className="input mt-1"
                      placeholder="치위생사"
                    />
                  </div>
                  <div>
                    <label className="label">부서</label>
                    <select
                      defaultValue={selectedEmployee?.department}
                      className="input mt-1"
                    >
                      <option value="">선택</option>
                      <option value="진료">진료</option>
                      <option value="진료지원">진료지원</option>
                      <option value="행정">행정</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">이메일</label>
                    <input
                      type="email"
                      defaultValue={selectedEmployee?.email}
                      className="input mt-1"
                      placeholder="email@clinic.com"
                    />
                  </div>
                  <div>
                    <label className="label">연락처</label>
                    <input
                      type="tel"
                      defaultValue={selectedEmployee?.phone}
                      className="input mt-1"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">입사일</label>
                    <input
                      type="date"
                      defaultValue={selectedEmployee?.hireDate}
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="label">고용형태</label>
                    <select
                      defaultValue={selectedEmployee?.employmentType}
                      className="input mt-1"
                    >
                      <option value="FULL_TIME">정규직</option>
                      <option value="PART_TIME">파트타임</option>
                      <option value="CONTRACT">계약직</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">기본급</label>
                  <input
                    type="number"
                    defaultValue={selectedEmployee?.baseSalary}
                    className="input mt-1"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedEmployee ? '수정' : '등록'}
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
