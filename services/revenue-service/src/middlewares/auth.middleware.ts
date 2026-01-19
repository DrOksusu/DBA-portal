import { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function extractUser(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string;
  const clinicId = req.headers['x-clinic-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  const userName = req.headers['x-user-name'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const permissions = req.headers['x-user-permissions'] as string;

  if (userId) {
    req.user = {
      id: userId,
      clinicId: clinicId || '',
      role: userRole || 'USER',
      email: userEmail || '',
      name: userName || '',
      permissions: permissions ? permissions.split(',') : [],
    };
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }
  next();
}

export function requireClinic(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.clinicId) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Clinic ID required',
    });
    return;
  }
  next();
}

export function verifyInternalToken(req: Request, res: Response, next: NextFunction): void {
  const serviceToken = req.headers['x-service-token'] as string;
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;

  if (!serviceToken || serviceToken !== expectedToken) {
    res.status(401).json({
      success: false,
      error: 'Invalid service token',
    });
    return;
  }

  next();
}
