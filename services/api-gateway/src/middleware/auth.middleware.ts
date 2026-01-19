import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../config/logger';

export interface JwtPayload {
  userId: string;
  clinicId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip auth for public routes
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/health',
      '/health',
    ];

    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Get token from header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: '인증이 필요합니다.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Add user info to request
    req.user = decoded;

    // Add user info to headers for downstream services
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-clinic-id'] = decoded.clinicId;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: '유효하지 않은 토큰입니다.',
      });
    }

    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '인증 처리 중 오류가 발생했습니다.',
    });
  }
};

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: '인증이 필요합니다.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '접근 권한이 없습니다.',
      });
    }

    next();
  };
};
