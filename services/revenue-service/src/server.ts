import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dailyReportRoutes from './routes/dailyReport.routes';
import analyticsRoutes from './routes/analytics.routes';
import excelRoutes from './routes/excel.routes';
import internalRoutes from './routes/internal.routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'revenue-service' });
});

// Routes
app.use('/daily-reports', dailyReportRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/excel', excelRoutes);
app.use('/internal', internalRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Revenue Service running on port ${PORT}`);
});

export { prisma };
