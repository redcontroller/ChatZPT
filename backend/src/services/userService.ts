import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import database, { User, DatabaseSchema } from '../database/connection';
import { UserPreferences } from '../../../shared/types/user';
import config from '../config';
import { generateSecureToken } from '../../../shared/utils/crypto';
import { addDays } from '../../../shared/utils/date';

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  private db: Low<DatabaseSchema> | null = null;

  private getDb(): Low<DatabaseSchema> {
    if (!this.db) {
      this.db = database.getDb();
    }
    return this.db;
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const { email, password, name } = userData;

    // Check if user already exists
    const existingUser = this.getDb().data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create user
    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: false,
      profile: {
        name: name || '',
        avatar: '',
        bio: '',
        preferences: {
          theme: 'system',
          language: 'ko',
          notifications: {
            email: true,
            push: true,
          },
        },
      },
      security: {
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
      },
    };

    // Save to database
    this.getDb().data.users.push(user);
    await database.getDb().write();

    // Remove password hash from returned user
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const user = this.getDb().data.users.find(u => u.id === userId && u.isActive);
    if (!user) return null;

    // Remove password hash from returned user
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const user = this.getDb().data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    if (!user) return null;

    // Remove password hash from returned user
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Get user with password (for authentication)
  async getUserWithPassword(email: string): Promise<User | null> {
    const user = this.getDb().data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    return user || null;
  }

  // Update user
  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = this.getDb().data.users[userIndex];

    // Update user data
    if (updateData.name !== undefined) {
      user.profile.name = updateData.name;
    }
    if (updateData.avatar !== undefined) {
      user.profile.avatar = updateData.avatar;
    }
    if (updateData.bio !== undefined) {
      user.profile.bio = updateData.bio;
    }
    if (updateData.preferences) {
      user.profile.preferences = {
        ...user.profile.preferences,
        ...updateData.preferences,
      };
    }

    user.updatedAt = new Date();

    // Save to database
    await database.getDb().write();

    // Remove password hash from returned user
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Change password
  async changePassword(userId: string, passwordData: ChangePasswordData): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = this.getDb().data.users[userIndex];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(passwordData.newPassword, config.BCRYPT_ROUNDS);

    // Update password
    user.passwordHash = newPasswordHash;
    user.security.lastPasswordChange = new Date();
    user.updatedAt = new Date();

    // Save to database
    await database.getDb().write();
  }

  // Verify password
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = this.getDb().data.users.find(u => u.id === userId && u.isActive);
    if (!user) return false;

    return await bcrypt.compare(password, user.passwordHash);
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) return;

    this.getDb().data.users[userIndex].lastLoginAt = new Date();
    this.getDb().data.users[userIndex].updatedAt = new Date();

    await database.getDb().write();
  }

  // Mark email as verified
  async markEmailVerified(userId: string): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.getDb().data.users[userIndex].emailVerified = true;
    this.getDb().data.users[userIndex].updatedAt = new Date();

    await database.getDb().write();
  }

  // Increment failed login attempts
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) return;

    const user = this.getDb().data.users[userIndex];
    user.security.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 30 minutes
    if (user.security.failedLoginAttempts >= 5) {
      user.security.lockedUntil = addDays(new Date(), 0.5); // 12 hours
    }

    user.updatedAt = new Date();

    await database.getDb().write();
  }

  // Reset failed login attempts
  async resetFailedLoginAttempts(userId: string): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) return;

    const user = this.getDb().data.users[userIndex];
    user.security.failedLoginAttempts = 0;
    user.security.lockedUntil = undefined;
    user.updatedAt = new Date();

    await database.getDb().write();
  }

  // Check if account is locked
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = this.getDb().data.users.find(u => u.id === userId && u.isActive);
    if (!user) return true;

    if (user.security.lockedUntil) {
      return new Date() < user.security.lockedUntil;
    }

    return false;
  }

  // Deactivate user account
  async deactivateUser(userId: string): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId && u.isActive);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.getDb().data.users[userIndex].isActive = false;
    this.getDb().data.users[userIndex].updatedAt = new Date();

    await database.getDb().write();
  }

  // Delete user account
  async deleteUser(userId: string): Promise<void> {
    const userIndex = this.getDb().data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Remove user from database
    this.getDb().data.users.splice(userIndex, 1);

    // Remove related data
    this.getDb().data.refreshTokens = this.getDb().data.refreshTokens.filter(t => t.userId !== userId);
    this.getDb().data.passwordResetTokens = this.getDb().data.passwordResetTokens.filter(t => t.userId !== userId);
    this.getDb().data.emailVerificationTokens = this.getDb().data.emailVerificationTokens.filter(t => t.userId !== userId);

    await database.getDb().write();
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    lockedUsers: number;
  }> {
    const totalUsers = this.getDb().data.users.length;
    const activeUsers = this.getDb().data.users.filter(u => u.isActive).length;
    const verifiedUsers = this.getDb().data.users.filter(u => u.isActive && u.emailVerified).length;
    const lockedUsers = this.getDb().data.users.filter(u => u.isActive && u.security.lockedUntil && new Date() < u.security.lockedUntil).length;

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      lockedUsers,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
