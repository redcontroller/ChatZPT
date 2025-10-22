import { Request, Response, NextFunction } from 'express';
import { ApiError, HttpStatus } from '../../../shared/types/api';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;
  public details?: string;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: string | undefined;

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid data format';
    code = 'INVALID_DATA_FORMAT';
    details = error.message;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid JSON format';
    code = 'INVALID_JSON';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      code,
      details,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } else {
    // Log error in production (without sensitive details)
    console.error('Error:', {
      message: error.message,
      statusCode,
      code,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // Send error response
  const errorResponse: ApiError = {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json({
    success: false,
    message,
    error: errorResponse,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiError = {
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    error: errorResponse,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const validationErrorHandler = (error: any): AppError => {
  if (error.details && Array.isArray(error.details)) {
    const validationErrors = error.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    return new AppError(
      'Validation failed',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'VALIDATION_ERROR',
      true,
      JSON.stringify(validationErrors)
    );
  }

  return new AppError(
    'Validation error',
    HttpStatus.BAD_REQUEST,
    'VALIDATION_ERROR',
    true,
    error.message
  );
};

// Database error handler
export const databaseErrorHandler = (error: any): AppError => {
  if (error.code === '11000') {
    // Duplicate key error
    return new AppError(
      'Resource already exists',
      HttpStatus.CONFLICT,
      'DUPLICATE_RESOURCE',
      true,
      'A resource with this information already exists'
    );
  }

  if (error.name === 'ValidationError') {
    return validationErrorHandler(error);
  }

  return new AppError(
    'Database error',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'DATABASE_ERROR',
    true,
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
};

// Rate limit error handler
export const rateLimitErrorHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiError = {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests',
    details: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'Rate limit exceeded',
    error: errorResponse,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  });
};

// CORS error handler
export const corsErrorHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiError = {
    code: 'CORS_ERROR',
    message: 'CORS policy violation',
    details: 'Request blocked by CORS policy',
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.FORBIDDEN).json({
    success: false,
    message: 'CORS policy violation',
    error: errorResponse,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  });
};
