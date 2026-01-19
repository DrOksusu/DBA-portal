import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add clinic ID header if available
    const clinicId = typeof window !== 'undefined'
      ? localStorage.getItem('clinicId')
      : null;

    if (clinicId) {
      config.headers['x-clinic-id'] = clinicId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
    return {
      success: false,
      error: 'Network error',
    };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: any }>({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    }),

  signup: (data: { email: string; password: string; name: string }) =>
    apiRequest<{ user: any }>({
      method: 'POST',
      url: '/auth/signup',
      data,
    }),

  logout: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/logout',
    }),

  getMe: () =>
    apiRequest<{ user: any }>({
      method: 'GET',
      url: '/auth/me',
    }),

  refresh: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/refresh',
    }),
};

// Revenue API
export const revenueApi = {
  getDailyReports: (params: { date?: string; startDate?: string; endDate?: string }) =>
    apiRequest<{ reports: any[] }>({
      method: 'GET',
      url: '/revenue/daily-reports',
      params,
    }),

  createIncome: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/revenue/daily-reports/income',
      data,
    }),

  createExpense: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/revenue/daily-reports/expense',
      data,
    }),

  getMonthlyAnalytics: (year: number, month: number) =>
    apiRequest<any>({
      method: 'GET',
      url: `/revenue/analytics/monthly/${year}/${month}`,
    }),

  getYearlyAnalytics: (year: number) =>
    apiRequest<any>({
      method: 'GET',
      url: `/revenue/analytics/yearly/${year}`,
    }),
};

// HR API
export const hrApi = {
  getEmployees: (params?: any) =>
    apiRequest<{ employees: any[]; pagination: any }>({
      method: 'GET',
      url: '/hr/employees',
      params,
    }),

  getEmployee: (id: string) =>
    apiRequest<any>({
      method: 'GET',
      url: `/hr/employees/${id}`,
    }),

  createEmployee: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/hr/employees',
      data,
    }),

  getSalaries: (year: number, month: number) =>
    apiRequest<{ salaries: any[] }>({
      method: 'GET',
      url: `/hr/salaries/monthly/${year}/${month}`,
    }),
};

// Inventory API
export const inventoryApi = {
  getProducts: (params?: any) =>
    apiRequest<{ products: any[]; pagination: any }>({
      method: 'GET',
      url: '/inventory/products',
      params,
    }),

  getProduct: (id: string) =>
    apiRequest<any>({
      method: 'GET',
      url: `/inventory/products/${id}`,
    }),

  getCurrentStock: () =>
    apiRequest<any[]>({
      method: 'GET',
      url: '/inventory/stock/current',
    }),
};

// Marketing API
export const marketingApi = {
  getCampaigns: (params?: any) =>
    apiRequest<{ campaigns: any[]; pagination: any }>({
      method: 'GET',
      url: '/marketing/campaigns',
      params,
    }),

  getMonthlyAnalytics: (year: number, month: number) =>
    apiRequest<any>({
      method: 'GET',
      url: `/marketing/analytics/monthly/${year}/${month}`,
    }),
};

export default api;
