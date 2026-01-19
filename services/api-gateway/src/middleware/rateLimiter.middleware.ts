import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests',
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts',
    message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter - more permissive for authenticated users
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: {
    success: false,
    error: 'Too many requests',
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
