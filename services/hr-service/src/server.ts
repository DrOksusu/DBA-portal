import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { logger } from '@vibe/utils';

import employeeRoutes from './routes/employee.routes';
import salaryRoutes from './routes/salary.routes';
import incentiveRoutes from './routes/incentive.routes';
import targetRoutes from './routes/target.routes';
import policyRoutes from './routes/policy.routes';
import internalRoutes from './routes/internal.routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hr-service' });
});

// Routes
app.use('/api/hr/employees', employeeRoutes);
app.use('/api/hr/salaries', salaryRoutes);
app.use('/api/hr/incentives', incentiveRoutes);
app.use('/api/hr/targets', targetRoutes);
app.use('/api/hr/policies', policyRoutes);
app.use('/api/internal/hr', internalRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`HR Service running on port ${PORT}`);
});

export { prisma };
