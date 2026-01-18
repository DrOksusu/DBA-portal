// ============ User & Auth Types ============

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TEAM_LEADER = 'TEAM_LEADER',
  MANAGER = 'MANAGER',
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
  teamName?: string;
  isTeamLeader?: boolean;
  permissions: string[];
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

// ============ Daily Report Types ============

export enum DailyReportType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  ORAL_PRODUCT_SALE = 'ORAL_PRODUCT_SALE',
}

export interface DailyReportBase {
  id: string;
  clinicId: string;
  userId: string;
  reportDate: string;
  type: DailyReportType;
  chartNumber?: string;
  patientName?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeReport extends DailyReportBase {
  type: DailyReportType.INCOME;
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;
}

export interface ExpenseReport extends DailyReportBase {
  type: DailyReportType.EXPENSE;
  expenseAmount?: number;
  expenseCategory?: string;
}

export interface OralProductSaleReport extends DailyReportBase {
  type: DailyReportType.ORAL_PRODUCT_SALE;
  productCode?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  discountRate?: number;
  paymentMethod?: string;
}

export type DailyReport = IncomeReport | ExpenseReport | OralProductSaleReport;

// ============ Message Types ============

export enum MessageType {
  SMS = 'SMS',
  LMS = 'LMS',
  MMS = 'MMS',
  KAKAO_ALIMTALK = 'KAKAO_ALIMTALK',
  KAKAO_FRIENDTALK = 'KAKAO_FRIENDTALK',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

// ============ Inventory Types ============

export enum StockLogType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

// ============ API Response Types ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ Service Communication Types ============

export interface ServiceRequest {
  serviceName: string;
  userId?: string;
  clinicId?: string;
  timestamp: number;
}

export interface InternalServiceHeaders {
  'x-service-name': string;
  'x-service-token': string;
  'x-user-id'?: string;
  'x-clinic-id'?: string;
  'x-user-role'?: string;
}

// ============ Error Types ============

export interface ServiceError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// ============ Clinic & Team Types ============

export interface Clinic {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  clinicId: string;
  teamName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Employee Types ============

export interface Employee {
  id: string;
  clinicId: string;
  employeeNumber?: string;
  name: string;
  position?: string;
  role?: string;
  isActive: boolean;
  hireDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Permission Types ============

export const PERMISSIONS = {
  DAILY_REPORT: {
    READ: 'daily_report:read',
    WRITE: 'daily_report:write',
  },
  HR: {
    READ: 'hr:read',
    WRITE: 'hr:write',
  },
  INVENTORY: {
    READ: 'inventory:read',
    WRITE: 'inventory:write',
  },
  MARKETING: {
    READ: 'marketing:read',
    WRITE: 'marketing:write',
  },
  ADMIN: {
    READ: 'admin:read',
    WRITE: 'admin:write',
  },
} as const;

export type Permission =
  | typeof PERMISSIONS.DAILY_REPORT[keyof typeof PERMISSIONS.DAILY_REPORT]
  | typeof PERMISSIONS.HR[keyof typeof PERMISSIONS.HR]
  | typeof PERMISSIONS.INVENTORY[keyof typeof PERMISSIONS.INVENTORY]
  | typeof PERMISSIONS.MARKETING[keyof typeof PERMISSIONS.MARKETING]
  | typeof PERMISSIONS.ADMIN[keyof typeof PERMISSIONS.ADMIN];
