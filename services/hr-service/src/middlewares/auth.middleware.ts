import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    clinicId?: string;
    permissions?: string[];
  };
}

// Extract user from x-user-* headers (set by gateway after token verification)
export const extractUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const userName = req.headers['x-user-name'] as string;
  const userRole = req.headers['x-user-role'] as string;
  const clinicId = req.headers['x-clinic-id'] as string;
  const permissions = req.headers['x-user-permissions'] as string;

  if (userId) {
    req.user = {
      id: userId,
      email: userEmail || '',
      name: userName || '',
      role: userRole || 'USER',
      clinicId: clinicId || undefined,
      permissions: permissions ? permissions.split(',') : [],
    };
  }

  next();
};

// Require authentication
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }
  next();
};

// Require clinic context
export const requireClinic = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.clinicId) {
    return res.status(400).json({
      success: false,
      error: 'Clinic context required',
    });
  }
  next();
};

// Require specific permission
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.permissions?.includes(permission) && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }
    next();
  };
};

// Require admin role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  next();
};

// Verify internal service token
export const verifyInternalToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-internal-token'] as string;
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token || token !== expectedToken) {
    return res.status(401).json({
      success: false,
      error: 'Invalid internal service token',
    });
  }

  next();
};
