import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Documentation',
    data: {
      version: '1.0.0',
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Register a new user',
          'POST /api/auth/login': 'Login user',
          'POST /api/auth/refresh': 'Refresh access token',
          'POST /api/auth/logout': 'Logout user',
          'POST /api/auth/forgot-password': 'Request password reset',
          'POST /api/auth/reset-password': 'Reset password',
          'POST /api/auth/verify-email': 'Verify email address',
          'POST /api/auth/resend-verification': 'Resend email verification',
          'GET /api/auth/me': 'Get current user (protected)',
        },
        user: {
          'GET /api/user/profile': 'Get user profile (protected)',
          'PUT /api/user/profile': 'Update user profile (protected)',
          'PATCH /api/user/profile': 'Partially update user profile (protected)',
          'PUT /api/user/change-password': 'Change password (protected)',
          'DELETE /api/user/account': 'Delete user account (protected)',
          'POST /api/user/deactivate': 'Deactivate user account (protected)',
          'PUT /api/user/preferences': 'Update user preferences (protected)',
          'PATCH /api/user/preferences': 'Partially update user preferences (protected)',
          'GET /api/user/activity': 'Get user activity (protected)',
          'GET /api/user/stats': 'Get user statistics (protected)',
        },
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    },
  });
});

export default router;
