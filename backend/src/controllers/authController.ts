import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { userService } from '../services/userService';
import { AppError } from '../middleware/errorMiddleware';
import { HttpStatus } from '../../../shared/types/api';
import { asyncHandler } from '../middleware/errorMiddleware';

export class AuthController {
  // Register new user
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    try {
      // Register user
      const { user, tokens } = await authService.register({
        email,
        password,
        name,
      });

      // Send welcome email with verification link
      await emailService.sendWelcomeEmail(email, name || 'User', '');

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.profile.name,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          },
          tokens,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new AppError(
          'User with this email already exists',
          HttpStatus.CONFLICT,
          'USER_ALREADY_EXISTS',
          true,
          'A user with this email address is already registered'
        );
      }
      throw error;
    }
  });

  // Login user
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, rememberMe } = req.body;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip;

    try {
      const tokens = await authService.login(
        { email, password, rememberMe },
        userAgent,
        ipAddress
      );

      // Get user data
      const user = await userService.getUserByEmail(email);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user!.id,
            email: user!.email,
            name: user!.profile.name,
            emailVerified: user!.emailVerified,
            lastLoginAt: user!.lastLoginAt,
          },
          tokens,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          throw new AppError(
            'Invalid email or password',
            HttpStatus.UNAUTHORIZED,
            'INVALID_CREDENTIALS',
            true,
            'The email or password you entered is incorrect'
          );
        }
        if (error.message.includes('Account is temporarily locked')) {
          throw new AppError(
            'Account is temporarily locked',
            HttpStatus.FORBIDDEN,
            'ACCOUNT_LOCKED',
            true,
            'Your account has been temporarily locked due to multiple failed login attempts'
          );
        }
      }
      throw error;
    }
  });

  // Refresh access token
  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip;

    try {
      const tokens = await authService.refreshToken(refreshToken, userAgent, ipAddress);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid refresh token')) {
          throw new AppError(
            'Invalid refresh token',
            HttpStatus.UNAUTHORIZED,
            'INVALID_REFRESH_TOKEN',
            true,
            'The refresh token is invalid or expired'
          );
        }
        if (error.message.includes('Refresh token expired')) {
          throw new AppError(
            'Refresh token expired',
            HttpStatus.UNAUTHORIZED,
            'REFRESH_TOKEN_EXPIRED',
            true,
            'The refresh token has expired. Please log in again'
          );
        }
      }
      throw error;
    }
  });

  // Logout user
  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    try {
      await authService.logout(refreshToken, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logout successful',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      // Logout should always succeed, even if there's an error
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logout successful',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    }
  });

  // Forgot password
  forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const ipAddress = req.ip;

    try {
      const token = await authService.generatePasswordResetToken(email, ipAddress);

      // Send password reset email
      const user = await userService.getUserByEmail(email);
      if (user) {
        await emailService.sendPasswordResetEmail(email, user.profile.name || 'User', token);
      }

      // Always return success to prevent email enumeration
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      // Always return success to prevent email enumeration
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    }
  });

  // Reset password
  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    try {
      await authService.usePasswordResetToken(token, password);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Password reset successful',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired')) {
          throw new AppError(
            'Invalid or expired reset token',
            HttpStatus.BAD_REQUEST,
            'INVALID_RESET_TOKEN',
            true,
            'The password reset token is invalid or has expired'
          );
        }
      }
      throw error;
    }
  });

  // Verify email
  verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;

    try {
      await authService.useEmailVerificationToken(token);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Email verified successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired')) {
          throw new AppError(
            'Invalid or expired verification token',
            HttpStatus.BAD_REQUEST,
            'INVALID_VERIFICATION_TOKEN',
            true,
            'The email verification token is invalid or has expired'
          );
        }
      }
      throw error;
    }
  });

  // Resend email verification
  resendVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    try {
      const user = await userService.getUserByEmail(email);
      if (!user) {
        // Always return success to prevent email enumeration
        res.status(HttpStatus.OK).json({
          success: true,
          message: 'If an account with that email exists, a verification email has been sent',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string,
          },
        });
        return;
      }

      if (user.emailVerified) {
        throw new AppError(
          'Email already verified',
          HttpStatus.BAD_REQUEST,
          'EMAIL_ALREADY_VERIFIED',
          true,
          'This email address has already been verified'
        );
      }

      // Generate new verification token
      const token = await authService.generateEmailVerificationToken(user.id);

      // Send verification email
      await emailService.sendEmailVerificationEmail(email, user.profile.name || 'User', token);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Verification email sent successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Always return success to prevent email enumeration
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'If an account with that email exists, a verification email has been sent',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    }
  });

  // Get current user (protected route)
  getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
        'NOT_AUTHENTICATED',
        true,
        'User must be authenticated to access this resource'
      );
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      throw new AppError(
        'User not found',
        HttpStatus.NOT_FOUND,
        'USER_NOT_FOUND',
        true,
        'User account not found'
      );
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.profile.name,
          avatar: user.profile.avatar,
          bio: user.profile.bio,
          emailVerified: user.emailVerified,
          preferences: user.profile.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    });
  });
}

// Export controller instance
export const authController = new AuthController();
