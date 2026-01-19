import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { config, ServiceKey } from '../config';
import { logger } from '../config/logger';

// Create proxy options for a service
const createProxyOptions = (serviceKey: ServiceKey): Options => {
  const service = config.services[serviceKey];

  return {
    target: service.url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceKey}`]: '/api',
    },
    onProxyReq: (proxyReq, req: Request) => {
      // Forward user information to downstream services
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.userId);
        proxyReq.setHeader('x-clinic-id', req.user.clinicId);
        proxyReq.setHeader('x-user-role', req.user.role);
        proxyReq.setHeader('x-user-email', req.user.email);
      }

      // Set internal service token for service-to-service communication
      proxyReq.setHeader('x-internal-token', config.jwt.secret);

      logger.debug(`Proxying ${req.method} ${req.path} -> ${service.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response status
      logger.debug(
        `Response from ${service.name}: ${proxyRes.statusCode} for ${req.method} ${req.path}`
      );
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${service.name}:`, err);

      if (!res.headersSent) {
        (res as Response).status(503).json({
          success: false,
          error: 'Service unavailable',
          message: `${service.name} 서비스에 연결할 수 없습니다.`,
        });
      }
    },
  };
};

// Auth service proxy
export const authProxy = createProxyMiddleware(createProxyOptions('auth'));

// Revenue service proxy
export const revenueProxy = createProxyMiddleware(createProxyOptions('revenue'));

// HR service proxy
export const hrProxy = createProxyMiddleware(createProxyOptions('hr'));

// Inventory service proxy
export const inventoryProxy = createProxyMiddleware(createProxyOptions('inventory'));

// Marketing service proxy
export const marketingProxy = createProxyMiddleware(createProxyOptions('marketing'));

// Clinic service proxy
export const clinicProxy = createProxyMiddleware(createProxyOptions('clinic'));
