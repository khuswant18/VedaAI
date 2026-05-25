import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

interface ErrorResponseBody {
  success: false;
  error: string;
  code: string;
  details?: Array<{ field: string; message: string }>;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error:', err.message);

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    const response: ErrorResponseBody = {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    };

    res.status(400).json(response);
    return;
  }

  if (err.message.includes('not found') || err.message.includes('Not found')) {
    const response: ErrorResponseBody = {
      success: false,
      error: err.message,
      code: 'NOT_FOUND',
    };
    res.status(404).json(response);
    return;
  }

  if (err.message.includes('AI') || err.message.includes('Claude') || err.message.includes('LLM')) {
    const response: ErrorResponseBody = {
      success: false,
      error: 'AI service error: ' + err.message,
      code: 'AI_SERVICE_ERROR',
    };
    res.status(502).json(response);
    return;
  }

  const response: ErrorResponseBody = {
    success: false,
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  };
  res.status(500).json(response);
}
