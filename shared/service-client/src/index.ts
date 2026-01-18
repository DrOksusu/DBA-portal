import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// ============ Types ============

export interface ServiceClientConfig {
  serviceName: string;
  timeout?: number;
}

export interface ServiceRequestOptions extends AxiosRequestConfig {
  userId?: string;
  clinicId?: string;
}

export type ServiceName = 'auth' | 'revenue' | 'hr' | 'inventory' | 'marketing' | 'clinic';

// ============ Service URLs ============

const SERVICE_URLS: Record<ServiceName, string> = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  revenue: process.env.REVENUE_SERVICE_URL || 'http://revenue-service:3002',
  hr: process.env.HR_SERVICE_URL || 'http://hr-service:3003',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3004',
  marketing: process.env.MARKETING_SERVICE_URL || 'http://marketing-service:3005',
  clinic: process.env.CLINIC_SERVICE_URL || 'http://clinic-service:3006',
};

// ============ Service Client Class ============

export class ServiceClient {
  private clients: Map<ServiceName, AxiosInstance> = new Map();
  private serviceName: string;

  constructor(config: ServiceClientConfig) {
    this.serviceName = config.serviceName;
    const timeout = config.timeout || 5000;

    // Create axios instances for each service
    (Object.keys(SERVICE_URLS) as ServiceName[]).forEach((name) => {
      this.clients.set(
        name,
        axios.create({
          baseURL: SERVICE_URLS[name],
          timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Name': this.serviceName,
            'X-Service-Token': process.env.INTERNAL_SERVICE_TOKEN || '',
          },
        })
      );
    });
  }

  private getClient(service: ServiceName): AxiosInstance {
    const client = this.clients.get(service);
    if (!client) {
      throw new Error(`Unknown service: ${service}`);
    }
    return client;
  }

  private buildHeaders(options?: ServiceRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {};

    if (options?.userId) {
      headers['X-User-ID'] = options.userId;
    }
    if (options?.clinicId) {
      headers['X-Clinic-ID'] = options.clinicId;
    }

    return headers;
  }

  async get<T>(
    service: ServiceName,
    path: string,
    options?: ServiceRequestOptions
  ): Promise<T> {
    const client = this.getClient(service);
    const response = await client.get<T>(path, {
      ...options,
      headers: {
        ...this.buildHeaders(options),
        ...options?.headers,
      },
    });
    return response.data;
  }

  async post<T>(
    service: ServiceName,
    path: string,
    data?: unknown,
    options?: ServiceRequestOptions
  ): Promise<T> {
    const client = this.getClient(service);
    const response = await client.post<T>(path, data, {
      ...options,
      headers: {
        ...this.buildHeaders(options),
        ...options?.headers,
      },
    });
    return response.data;
  }

  async put<T>(
    service: ServiceName,
    path: string,
    data?: unknown,
    options?: ServiceRequestOptions
  ): Promise<T> {
    const client = this.getClient(service);
    const response = await client.put<T>(path, data, {
      ...options,
      headers: {
        ...this.buildHeaders(options),
        ...options?.headers,
      },
    });
    return response.data;
  }

  async patch<T>(
    service: ServiceName,
    path: string,
    data?: unknown,
    options?: ServiceRequestOptions
  ): Promise<T> {
    const client = this.getClient(service);
    const response = await client.patch<T>(path, data, {
      ...options,
      headers: {
        ...this.buildHeaders(options),
        ...options?.headers,
      },
    });
    return response.data;
  }

  async delete<T>(
    service: ServiceName,
    path: string,
    options?: ServiceRequestOptions
  ): Promise<T> {
    const client = this.getClient(service);
    const response = await client.delete<T>(path, {
      ...options,
      headers: {
        ...this.buildHeaders(options),
        ...options?.headers,
      },
    });
    return response.data;
  }
}

// ============ Factory Function ============

export function createServiceClient(serviceName: string): ServiceClient {
  return new ServiceClient({ serviceName });
}

// ============ Error Handler ============

export function isServiceError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function getServiceErrorMessage(error: unknown): string {
  if (isServiceError(error)) {
    if (error.response?.data) {
      const data = error.response.data as { message?: string; error?: string };
      return data.message || data.error || error.message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}

// ============ Typed Service Methods ============

export interface AuthServiceClient {
  verifyToken(token: string): Promise<{ valid: boolean; user?: unknown }>;
  getUser(userId: string): Promise<unknown>;
}

export interface RevenueServiceClient {
  getMonthlyTotal(clinicId: string, year: number, month: number): Promise<{ total: number }>;
  getDailyReports(clinicId: string, date: string): Promise<unknown[]>;
}

export interface HRServiceClient {
  getEmployees(clinicId: string): Promise<unknown[]>;
  getEmployee(clinicId: string, employeeId: string): Promise<unknown>;
}

export interface ClinicServiceClient {
  getClinic(clinicId: string): Promise<unknown>;
  getTeams(clinicId: string): Promise<unknown[]>;
}

// ============ Pre-configured Clients ============

export function createAuthClient(serviceName: string): ServiceClient & {
  auth: {
    verifyToken: (token: string) => Promise<{ valid: boolean; user?: unknown }>;
  };
} {
  const client = createServiceClient(serviceName);

  return Object.assign(client, {
    auth: {
      verifyToken: async (token: string) => {
        return client.post<{ valid: boolean; user?: unknown }>('auth', '/internal/verify', { token });
      },
    },
  });
}

export function createRevenueClient(serviceName: string): ServiceClient & {
  revenue: {
    getMonthlyTotal: (clinicId: string, year: number, month: number) => Promise<{ total: number }>;
  };
} {
  const client = createServiceClient(serviceName);

  return Object.assign(client, {
    revenue: {
      getMonthlyTotal: async (clinicId: string, year: number, month: number) => {
        return client.get<{ total: number }>(
          'revenue',
          `/internal/revenue/monthly-total?clinicId=${clinicId}&year=${year}&month=${month}`
        );
      },
    },
  });
}
