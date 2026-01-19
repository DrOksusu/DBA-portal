'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  position: string;
  baseSalary: number;
  bonus: number;
  incentive: number;
  overtimePay: number;
  deductions: {
    nationalPension: number;
    healthInsurance: number;
    employmentInsurance: number;
    incomeTax: number;
    localIncomeTax: number;
  };
  totalDeductions: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
}

// 임시 데이터
const salaryRecords: SalaryRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: '김영희',
    employeeNumber: 'EMP001',
    position: '원장',
    baseSalary: 8000000,
    bonus: 1000000,
    incentive: 500000,
    overtimePay: 0,
    deductions: {
      nationalPension: 360000,
      healthInsurance: 286160,
      employmentInsurance: 76000,
      incomeTax: 850000,
      localIncomeTax: 85000,
    },
    totalDeductions: 1657160,
    netSalary: 7842840,
    paymentStatus: 'PAID',
    paymentDate: '2024-01-25',
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: '이철수',
    employeeNumber: 'EMP002',
    position: '치과의사',
    baseSalary: 6000000,
    bonus: 500000,
    incentive: 300000,
    overtimePay: 0,
    deductions: {
      nationalPension: 270000,
      healthInsurance: 214620,
      employmentInsurance: 57000,
      incomeTax: 520000,
      localIncomeTax: 52000,
    },
    totalDeductions: 1113620,
    netSalary: 5686380,
    paymentStatus: 'PAID',
    paymentDate: '2024-01-25',
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: '박미정',
    employeeNumber: 'EMP003',
    position: '치위생사',
    baseSalary: 3200000,
    bonus: 200000,
    incentive: 150000,
    overtimePay: 180000,
    deductions: {
      nationalPension: 144000,
      healthInsurance: 114464,
      employmentInsurance: 30400,
      incomeTax: 145000,
      localIncomeTax: 14500,
    },
    totalDeductions: 448364,
    netSalary: 3281636,
    paymentStatus: 'PENDING',
  },
  {
    id: '4',
    employeeId: '5',
    employeeName: '최민호',
    employeeNumber: 'EMP005',
    position: '데스크',
    baseSalary: 1800000,
    bonus: 0,
    incentive: 0,
    overtimePay: 120000,
    deductions: {
      nationalPension: 81000,
      healthInsurance: 64386,
      employmentInsurance: 17100,
      incomeTax: 35000,
      localIncomeTax: 3500,
    },
    totalDeductions: 200986,
    netSalary: 1719014,
    paymentStatus: 'PENDING',
  },
];

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: '대기',
  PAID: '지급완료',
  CANCELLED: '취소',
};

const statusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusIcons: Record<PaymentStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  PAID: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
};

export default function SalariesPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);

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

  const totalGrossSalary = salaryRecords.reduce(
    (sum, r) => sum + r.baseSalary + r.bonus + r.incentive + r.overtimePay,
    0
  );

  const totalDeductions = salaryRecords.reduce((sum, r) => sum + r.totalDeductions, 0);

  const totalNetSalary = salaryRecords.reduce((sum, r) => sum + r.netSalary, 0);

  return (
    <>
      <Header title="급여 관리" />

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
                {year}년 {month}월 급여
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary">
              <FileText className="h-4 w-4 mr-2" />
              급여 생성
            </button>
            <button className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 지급액 (세전)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalGrossSalary)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 공제액</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalDeductions)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">총 실지급액</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(totalNetSalary)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">지급 현황</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-green-600 font-semibold">
                  완료 {salaryRecords.filter((r) => r.paymentStatus === 'PAID').length}
                </span>
                <span className="text-yellow-600 font-semibold">
                  대기 {salaryRecords.filter((r) => r.paymentStatus === 'PENDING').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">급여 명세</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    사번
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    이름
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    기본급
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    상여
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    인센티브
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    연장근무
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    공제합계
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    실지급액
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salaryRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {record.employeeNumber}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">{record.position}</div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(record.baseSalary)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(record.bonus)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-green-600">
                      {formatCurrency(record.incentive)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(record.overtimePay)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-red-600">
                      -{formatCurrency(record.totalDeductions)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-primary-600">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full',
                          statusColors[record.paymentStatus]
                        )}
                      >
                        {statusIcons[record.paymentStatus]}
                        <span>{statusLabels[record.paymentStatus]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setSelectedRecord(null)}
              />
              <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    급여 상세 - {selectedRecord.employeeName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {year}년 {month}월
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* 지급 내역 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">지급 내역</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">기본급</span>
                        <span className="font-medium">
                          {formatCurrency(selectedRecord.baseSalary)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">상여금</span>
                        <span className="font-medium">
                          {formatCurrency(selectedRecord.bonus)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">인센티브</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(selectedRecord.incentive)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">연장근무수당</span>
                        <span className="font-medium">
                          {formatCurrency(selectedRecord.overtimePay)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span>지급액 합계</span>
                        <span>
                          {formatCurrency(
                            selectedRecord.baseSalary +
                              selectedRecord.bonus +
                              selectedRecord.incentive +
                              selectedRecord.overtimePay
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 공제 내역 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">공제 내역</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">국민연금</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedRecord.deductions.nationalPension)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">건강보험</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedRecord.deductions.healthInsurance)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">고용보험</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedRecord.deductions.employmentInsurance)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">소득세</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedRecord.deductions.incomeTax)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">지방소득세</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedRecord.deductions.localIncomeTax)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span>공제액 합계</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedRecord.totalDeductions)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 실지급액 */}
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary-700">
                        실지급액
                      </span>
                      <span className="text-2xl font-bold text-primary-700">
                        {formatCurrency(selectedRecord.netSalary)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="btn-secondary"
                  >
                    닫기
                  </button>
                  {selectedRecord.paymentStatus === 'PENDING' && (
                    <button className="btn-primary">지급 처리</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
