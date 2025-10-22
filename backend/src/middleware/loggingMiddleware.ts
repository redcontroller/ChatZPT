import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chatzpt-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLoggingMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;

  logger.error('Request error', {
    requestId,
    method: req.method,
    url: req.url,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  next(error);
};

// Morgan configuration for HTTP request logging
export const morganMiddleware = morgan(
  (tokens, req, res) => {
    const requestId = req.headers['x-request-id'] as string;
    
    return JSON.stringify({
      requestId,
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: tokens['response-time'](req, res),
      userAgent: tokens['user-agent'](req, res),
      ip: tokens['remote-addr'](req, res),
      timestamp: new Date().toISOString(),
    });
  },
  {
    stream: {
      write: (message: string) => {
        logger.info('HTTP Request', JSON.parse(message));
      },
    },
  }
);

// Security logging middleware
export const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  const url = req.url;
  const method = req.method;

  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent || '')
  );

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      requestId,
      method,
      url,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  // Log authentication attempts
  if (url.includes('/auth/login') || url.includes('/auth/register')) {
    logger.info('Authentication attempt', {
      requestId,
      method,
      url,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Performance logging middleware
export const performanceLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  const requestId = req.headers['x-request-id'] as string;

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      });
    }

    // Log performance metrics
    logger.info('Request performance', {
      requestId,
      method: req.method,
      url: req.url,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

// Database query logging middleware
export const databaseLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;

  // TODO: Implement database logging when database connection is available
  logger.debug('Database logging middleware active', { requestId });

  next();
};

// User activity logging middleware
export const userActivityLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;
  const userId = req.user?.id;

  if (userId) {
    // Log user activity
    logger.info('User activity', {
      requestId,
      userId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Export logger instance
export { logger };

// Export logging utilities
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
    ...meta,
  });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};
