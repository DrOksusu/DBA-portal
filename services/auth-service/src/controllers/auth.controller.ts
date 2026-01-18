import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { setAuthCookies, clearAuthCookies, verifyAccessToken } from '../services/token.service';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  clinicId: z.string().optional(),
});

export async function login(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const { email, password } = validation.data;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinicId,
        },
        accessToken,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return res.status(401).json({
      success: false,
      error: 'Authentication Failed',
      message,
    });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const { email, password, name, clinicId } = validation.data;
    const user = await authService.createUser(email, password, name, clinicId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    const status = message.includes('already registered') ? 409 : 400;
    return res.status(status).json({
      success: false,
      error: 'Signup Failed',
      message,
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    const userId = req.user?.id;

    if (userId) {
      await authService.logoutUser(userId, refreshToken);
    }

    clearAuthCookies(res);

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    clearAuthCookies(res);
    return res.json({
      success: true,
      message: 'Logged out',
    });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided',
      });
    }

    const { user, accessToken, refreshToken: newRefreshToken } =
      await authService.refreshUserToken(refreshToken);

    setAuthCookies(res, accessToken, newRefreshToken);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinicId,
        },
        accessToken,
      },
    });
  } catch (error) {
    clearAuthCookies(res);
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return res.status(401).json({
      success: false,
      error: 'Token Refresh Failed',
      message,
    });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.access_token;

    let token = '';
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const result = await authService.verifyToken(token);

    if (!result.valid) {
      return res.status(401).json({ valid: false });
    }

    // Set headers for nginx auth_request
    res.set('X-User-ID', result.user?.id || '');
    res.set('X-Clinic-ID', result.user?.clinicId || '');
    res.set('X-User-Role', result.user?.role || '');
    res.set('X-User-Name', result.user?.name || '');
    res.set('X-User-Email', result.user?.email || '');
    res.set('X-User-Permissions', (result.user?.permissions as string[] || []).join(','));

    return res.status(200).json({ valid: true });
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
}
