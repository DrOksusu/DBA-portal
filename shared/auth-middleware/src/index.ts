import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ============ Types ============

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

// ============ Gateway에서 전달받은 헤더로 사용자 정보 추출 ============

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

// ============ 인증 필수 미들웨어 ============

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required'
    });
    return;
  }
  next();
}

// ============ 내부 서비스 간 통신 검증 ============

export function verifyInternalToken(req: Request, res: Response, next: NextFunction): void {
  const serviceToken = req.headers['x-service-token'] as string;
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;

  if (!serviceToken || serviceToken !== expectedToken) {
    res.status(401).json({
      success: false,
      error: 'Invalid service token',
      message: 'Internal service authentication failed'
    });
    return;
  }

  next();
}

// ============ 권한 체크 미들웨어 ============

export function requirePermission(resource: string, action: string = 'read') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    // Admin은 모든 권한
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    const requiredPermission = `${resource}:${action}`;
    if (!req.user.permissions.includes(requiredPermission)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Permission denied: ${requiredPermission} required`
      });
      return;
    }

    next();
  };
}

// ============ 역할 체크 미들웨어 ============

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Role required: ${roles.join(' or ')}`
      });
      return;
    }

    next();
  };
}

// ============ clinicId 필수 체크 ============

export function requireClinic(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.clinicId) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Clinic ID required'
    });
    return;
  }
  next();
}

// ============ JWT 검증 (Auth Service 내부용) ============

export function verifyAccessToken(token: string, secret: string): {
  sub: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  permissions: string[];
} {
  return jwt.verify(token, secret) as {
    sub: string;
    email: string;
    name: string;
    role: string;
    clinicId: string;
    permissions: string[];
  };
}

export function verifyRefreshToken(token: string, secret: string): { sub: string } {
  return jwt.verify(token, secret) as { sub: string };
}

// ============ 조합 미들웨어 ============

export function authAndClinic(req: Request, res: Response, next: NextFunction): void {
  extractUser(req, res, () => {
    requireAuth(req, res, () => {
      requireClinic(req, res, next);
    });
  });
}
