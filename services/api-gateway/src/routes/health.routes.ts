import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config, ServiceKey } from '../config';
import { logger } from '../config/logger';

const router = Router();

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

// Check individual service health
const checkServiceHealth = async (serviceKey: ServiceKey): Promise<ServiceHealth> => {
  const service = config.services[serviceKey];
  const startTime = Date.now();

  try {
    const response = await axios.get(`${service.url}/health`, {
      timeout: 5000,
    });

    return {
      name: service.name,
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Gateway health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// All services health check
router.get('/services', async (req: Request, res: Response) => {
  try {
    const serviceKeys = Object.keys(config.services) as ServiceKey[];
    const healthChecks = await Promise.all(
      serviceKeys.map((key) => checkServiceHealth(key))
    );

    const allHealthy = healthChecks.every((h) => h.status === 'healthy');

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      gateway: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      services: healthChecks,
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: '서비스 상태 확인 중 오류가 발생했습니다.',
    });
  }
});

// Individual service health check
router.get('/services/:service', async (req: Request, res: Response) => {
  const serviceKey = req.params.service as ServiceKey;

  if (!config.services[serviceKey]) {
    return res.status(404).json({
      success: false,
      error: 'Service not found',
      message: '존재하지 않는 서비스입니다.',
    });
  }

  try {
    const health = await checkServiceHealth(serviceKey);
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      ...health,
    });
  } catch (error) {
    logger.error(`Health check error for ${serviceKey}:`, error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: '서비스 상태 확인 중 오류가 발생했습니다.',
    });
  }
});

export default router;
