import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      name: 'auth-service',
    },
    revenue: {
      url: process.env.REVENUE_SERVICE_URL || 'http://localhost:3002',
      name: 'revenue-service',
    },
    hr: {
      url: process.env.HR_SERVICE_URL || 'http://localhost:3003',
      name: 'hr-service',
    },
    inventory: {
      url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004',
      name: 'inventory-service',
    },
    marketing: {
      url: process.env.MARKETING_SERVICE_URL || 'http://localhost:3005',
      name: 'marketing-service',
    },
    clinic: {
      url: process.env.CLINIC_SERVICE_URL || 'http://localhost:3006',
      name: 'clinic-service',
    },
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3007'],
    credentials: true,
  },
};

export type ServiceKey = keyof typeof config.services;
