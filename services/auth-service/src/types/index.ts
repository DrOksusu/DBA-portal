import { Request } from 'express';

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

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  clinicId?: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface ApproveUserRequest {
  clinicId: string;
  role?: string;
  permissions?: string[];
}
