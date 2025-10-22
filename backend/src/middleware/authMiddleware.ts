import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import database from '../database/connection';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

interface JWTPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
  jti?: string;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        error: {
          code: 'AUTHENTICATION_ERROR',
          details: 'No token provided'
        }
      });
      return;
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Check if token is access token
    if (decoded.type !== 'access') {
      res.status(401).json({
        success: false,
        message: 'Invalid token type',
        error: {
          code: 'AUTHENTICATION_ERROR',
          details: 'Token is not an access token'
        }
      });
      return;
    }

    // Get database instance
    const db = database.getDb();

    // Check if user exists and is active
    const user = db.data.users.find(u => u.id === decoded.sub && u.isActive);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: {
          code: 'AUTHENTICATION_ERROR',
          details: 'User does not exist or is inactive'
        }
      });
      return;
    }

    // Check if user account is locked
    if (user.security.lockedUntil && user.security.lockedUntil > new Date()) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        error: {
          code: 'ACCOUNT_LOCKED',
          details: 'Account is locked due to multiple failed login attempts'
        }
      });
      return;
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: {
          code: 'AUTHENTICATION_ERROR',
          details: 'Token is invalid or expired'
        }
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        error: {
          code: 'TOKEN_EXPIRED',
          details: 'Access token has expired'
        }
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Authentication service error'
      }
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Try to authenticate, but don't fail if token is invalid
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    if (decoded.type === 'access') {
      const db = database.getDb();
      const user = db.data.users.find(u => u.id === decoded.sub && u.isActive);
      
      if (user && (!user.security.lockedUntil || user.security.lockedUntil <= new Date())) {
        req.user = {
          id: user.id,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        code: 'AUTHENTICATION_ERROR',
        details: 'User must be authenticated'
      }
    });
    return;
  }

  const db = database.getDb();
  const user = db.data.users.find(u => u.id === req.user!.id);
  
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
      error: {
        code: 'USER_NOT_FOUND',
        details: 'User does not exist'
      }
    });
    return;
  }

  if (!user.emailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        details: 'User must verify email before accessing this resource'
      }
    });
    return;
  }

  next();
};
