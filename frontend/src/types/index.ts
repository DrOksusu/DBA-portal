export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  clinicId?: string;
}

export interface Clinic {
  id: string;
  name: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
}

export interface DailyReport {
  id: string;
  clinicId: string;
  userId: string;
  reportDate: string;
  type: 'INCOME' | 'EXPENSE' | 'ORAL_PRODUCT_SALE';
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
  expenseAmount?: number;
  expenseCategory?: string;
  productCode?: string;
  quantity?: number;
  unitPrice?: number;
  description?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  employmentType: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  hireDate: string;
  baseSalary: number;
}

export interface Product {
  id: string;
  clinicId: string;
  code: string;
  name: string;
  category: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
}

export interface Campaign {
  id: string;
  clinicId: string;
  name: string;
  channel: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  budgetAmount: number;
  spentAmount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
