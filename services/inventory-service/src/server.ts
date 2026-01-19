import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { logger } from '@vibe/utils';

import productRoutes from './routes/product.routes';
import supplierRoutes from './routes/supplier.routes';
import stockRoutes from './routes/stock.routes';
import internalRoutes from './routes/internal.routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inventory-service' });
});

// Routes
app.use('/api/inventory/products', productRoutes);
app.use('/api/inventory/suppliers', supplierRoutes);
app.use('/api/inventory/stock', stockRoutes);
app.use('/api/internal/inventory', internalRoutes);

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
  logger.info(`Inventory Service running on port ${PORT}`);
});

export { prisma };
