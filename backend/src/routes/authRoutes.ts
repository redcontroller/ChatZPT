import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  validateLogin,
  validateRegister,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
  validateResendVerification,
} from '../middleware/validationMiddleware';
import { authRateLimit } from '../middleware/securityMiddleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', authRateLimit, validateRegister, authController.register);
router.post('/login', authRateLimit, validateLogin, authController.login);
router.post('/refresh', validateRefreshToken, authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authRateLimit, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/resend-verification', authRateLimit, validateResendVerification, authController.resendVerification);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
