import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { logger } from './config/logger';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API gateway
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-clinic-id'],
}));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Cookie parser
app.use(cookieParser());

// Body parsing (for non-proxied routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting
app.use(generalLimiter);

// Routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: '요청하신 리소스를 찾을 수 없습니다.',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: '서버 오류가 발생했습니다.',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 API Gateway running on port ${config.port}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
  logger.info('📡 Connected services:');
  Object.entries(config.services).forEach(([key, service]) => {
    logger.info(`   - ${service.name}: ${service.url}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
