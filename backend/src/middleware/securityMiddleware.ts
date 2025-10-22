import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import config from '../config';
import { AppError } from './errorMiddleware';
import { HttpStatus } from '../../../shared/types/api';

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
  const allowedOrigins = [
    config.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://chatzpt.com',
    'https://www.chatzpt.com',
  ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
};

// CORS middleware
export const corsMiddleware = cors(corsOptions);

// Helmet configuration for security headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        message: message || 'Too many requests from this IP, please try again later.',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded',
          timestamp: new Date().toISOString(),
        },
      });
    },
  });
};

// General rate limiting
export const generalRateLimit = createRateLimit(
  config.RATE_LIMIT_WINDOW_MS,
  config.RATE_LIMIT_MAX_REQUESTS,
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later.'
);

// Password reset rate limiting
export const passwordResetRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many password reset attempts, please try again later.'
);

// Email verification rate limiting
export const emailVerificationRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // 5 attempts
  'Too many email verification attempts, please try again later.'
);

// IP whitelist middleware
export const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (allowedIPs.length > 0 && clientIP && !allowedIPs.includes(clientIP)) {
    throw new AppError(
      'Access denied',
      HttpStatus.FORBIDDEN,
      'IP_NOT_ALLOWED',
      true,
      'Your IP address is not allowed to access this resource'
    );
  }
  
  next();
};

// Request size limiting middleware
export const requestSizeLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.get('content-length') || '0');
  
  if (contentLength > maxSize) {
    throw new AppError(
      'Request too large',
      HttpStatus.PAYLOAD_TOO_LARGE,
      'REQUEST_TOO_LARGE',
      true,
      'Request size exceeds the maximum allowed limit'
    );
  }
  
  next();
};

// XSS protection middleware
export const xssProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// SQL injection protection middleware
export const sqlInjectionProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*IN\s*\(['"])/i,
    /(\b(OR|AND)\s+['"]\s*BETWEEN\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*EXISTS\s*\(['"])/i,
    /(\b(OR|AND)\s+['"]\s*NOT\s+EXISTS\s*\(['"])/i,
  ];

  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(checkForSQLInjection);
    }
    
    if (value && typeof value === 'object') {
      return Object.values(value).some(checkForSQLInjection);
    }
    
    return false;
  };

  const hasSQLInjection = checkForSQLInjection(req.body) || checkForSQLInjection(req.query) || checkForSQLInjection(req.params);

  if (hasSQLInjection) {
    throw new AppError(
      'Invalid request',
      HttpStatus.BAD_REQUEST,
      'SQL_INJECTION_DETECTED',
      true,
      'Request contains potentially malicious content'
    );
  }

  next();
};

// Directory traversal protection middleware
export const directoryTraversalProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const directoryTraversalPatterns = [
    /\.\./,
    /\.\.%2f/i,
    /\.\.%5c/i,
    /\.\.%252f/i,
    /\.\.%255c/i,
  ];

  const checkForDirectoryTraversal = (value: any): boolean => {
    if (typeof value === 'string') {
      return directoryTraversalPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(checkForDirectoryTraversal);
    }
    
    if (value && typeof value === 'object') {
      return Object.values(value).some(checkForDirectoryTraversal);
    }
    
    return false;
  };

  const hasDirectoryTraversal = checkForDirectoryTraversal(req.body) || checkForDirectoryTraversal(req.query) || checkForDirectoryTraversal(req.params);

  if (hasDirectoryTraversal) {
    throw new AppError(
      'Invalid request',
      HttpStatus.BAD_REQUEST,
      'DIRECTORY_TRAVERSAL_DETECTED',
      true,
      'Request contains potentially malicious content'
    );
  }

  next();
};

// Content type validation middleware
export const contentTypeValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedContentTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  const contentType = req.get('content-type');
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!contentType || !allowedContentTypes.some(type => contentType.includes(type))) {
      throw new AppError(
        'Invalid content type',
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        'INVALID_CONTENT_TYPE',
        true,
        'Content type not supported'
      );
    }
  }

  next();
};

// Security headers middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request timeout middleware
export const requestTimeoutMiddleware = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(HttpStatus.REQUEST_TIMEOUT).json({
          success: false,
          message: 'Request timeout',
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request took too long to process',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }, timeout);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
};
