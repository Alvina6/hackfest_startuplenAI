import type { NextFunction, Request, Response } from 'express';
import { ServiceError } from './geminiService.ts';

interface RateBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateBucket>();

export function createAiRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';
    const key = `${req.path}:${clientIp}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

    if (bucket.timestamps.length >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many AI requests in a short window. Please wait a minute and retry.',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
      return;
    }

    bucket.timestamps.push(now);
    buckets.set(key, bucket);
    next();
  };
}

export function validateUuidParam(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  if (!id || !/^[a-zA-Z0-9_-]{8,80}$/.test(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid analysis identifier format.',
      error: {
        code: 'INVALID_ID',
      },
    });
    return;
  }
  next();
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  console.error('Unhandled server error:', err instanceof Error ? err.message : 'Unknown error');
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}
