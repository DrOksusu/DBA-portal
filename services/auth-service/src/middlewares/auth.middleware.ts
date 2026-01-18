import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';

export function extractUser(req: Request, res: Response, next: NextFunction): void {
  try {
    // First check for Gateway headers
    const userId = req.headers['x-user-id'] as string;
    const clinicId = req.headers['x-clinic-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (userId) {
      req.user = {
        id: userId,
        clinicId: clinicId || '',
        role: userRole || 'USER',
        email: '',
        name: '',
        permissions: [],
      };
      return next();
    }

    // Try to extract from token
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.access_token;

    let token = '';
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        clinicId: payload.clinicId,
        permissions: payload.permissions,
      };
    }
  } catch (error) {
    // Token invalid or expired, but don't block - let requireAuth handle it
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

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required',
    });
    return;
  }

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Role required: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
}
