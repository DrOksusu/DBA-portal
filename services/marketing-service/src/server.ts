import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { logger } from '@vibe/utils';

import campaignRoutes from './routes/campaign.routes';
import expenseRoutes from './routes/expense.routes';
import analyticsRoutes from './routes/analytics.routes';
import sourceRoutes from './routes/source.routes';
import internalRoutes from './routes/internal.routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'marketing-service' });
});

// Routes
app.use('/api/marketing/campaigns', campaignRoutes);
app.use('/api/marketing/expenses', expenseRoutes);
app.use('/api/marketing/analytics', analyticsRoutes);
app.use('/api/marketing/sources', sourceRoutes);
app.use('/api/internal/marketing', internalRoutes);

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
  logger.info(`Marketing Service running on port ${PORT}`);
});

export { prisma };
