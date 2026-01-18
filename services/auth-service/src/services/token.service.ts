import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-at-least-32-characters';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key-32-chars';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';

export function generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { sub: payload.sub, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: isProduction ? COOKIE_DOMAIN : undefined,
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  // Refresh Token cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: isProduction ? COOKIE_DOMAIN : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookies(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('access_token', {
    domain: isProduction ? COOKIE_DOMAIN : undefined,
    path: '/',
  });
  res.clearCookie('refresh_token', {
    domain: isProduction ? COOKIE_DOMAIN : undefined,
    path: '/',
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string; type: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string; type: string };
}

export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
}
