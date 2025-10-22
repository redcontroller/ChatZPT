import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { AppError } from '../middleware/errorMiddleware';
import { HttpStatus } from '../../../shared/types/api';
import { asyncHandler } from '../middleware/errorMiddleware';

export class UserController {
  // Get user profile
  getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
      message: 'Profile retrieved successfully',
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

  // Update user profile
  updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { name, avatar, bio, preferences } = req.body;

    if (!userId) {
      throw new AppError(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
        'NOT_AUTHENTICATED',
        true,
        'User must be authenticated to access this resource'
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await userService.updateUser(userId, updateData);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Profile updated successfully',
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

  // Change password
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new AppError(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
        'NOT_AUTHENTICATED',
        true,
        'User must be authenticated to access this resource'
      );
    }

    try {
      await userService.changePassword(userId, {
        currentPassword,
        newPassword,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Password changed successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          throw new AppError(
            'Current password is incorrect',
            HttpStatus.BAD_REQUEST,
            'INCORRECT_CURRENT_PASSWORD',
            true,
            'The current password you entered is incorrect'
          );
        }
      }
      throw error;
    }
  });

  // Delete user account
  deleteAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

    await userService.deleteUser(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Account deleted successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    });
  });

  // Deactivate user account
  deactivateAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

    await userService.deactivateUser(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Account deactivated successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    });
  });

  // Get user statistics (admin only)
  getUserStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

    // Check if user is admin (you can implement admin role checking here)
    // For now, we'll allow any authenticated user to see stats
    const stats = await userService.getUserStats();

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        stats,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    });
  });

  // Update user preferences
  updatePreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { preferences } = req.body;

    if (!userId) {
      throw new AppError(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
        'NOT_AUTHENTICATED',
        true,
        'User must be authenticated to access this resource'
      );
    }

    const user = await userService.updateUser(userId, { preferences });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          preferences: user.profile.preferences,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    });
  });

  // Get user activity (placeholder for future implementation)
  getUserActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

    // Placeholder for user activity data
    const activity = {
      lastLogin: new Date().toISOString(),
      totalSessions: 1,
      accountAge: '1 day',
    };

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'User activity retrieved successfully',
      data: {
        activity,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    });
  });
}

// Export controller instance
export const userController = new UserController();
