import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import database, { RefreshToken, PasswordResetToken, EmailVerificationToken, DatabaseSchema } from '../database/connection';
import config from '../config';
import { userService } from './userService';
import { generateSecureToken, generatePasswordResetToken, generateEmailVerificationToken } from '../../../shared/utils/crypto';
import { addDays } from '../../../shared/utils/date';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
  jti?: string;
}

export class AuthService {
  private db: Low<DatabaseSchema> | null = null;

  private getDb(): Low<DatabaseSchema> {
    if (!this.db) {
      this.db = database.getDb();
    }
    return this.db;
  }

  // Login user
  async login(credentials: LoginCredentials, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
    const { email, password, rememberMe = false } = credentials;

    // Get user with password
    const user = await userService.getUserWithPassword(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    const isLocked = await userService.isAccountLocked(user.id);
    if (isLocked) {
      throw new Error('Account is temporarily locked due to multiple failed login attempts');
    }

    // Verify password
    const isPasswordValid = await userService.verifyPassword(user.id, password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await userService.incrementFailedLoginAttempts(user.id);
      throw new Error('Invalid email or password');
    }

    // Reset failed login attempts on successful login
    await userService.resetFailedLoginAttempts(user.id);

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, rememberMe);

    // Store refresh token
    await this.storeRefreshToken(tokens.refreshToken, user.id, userAgent, ipAddress);

    return tokens;
  }

  // Register new user
  async register(userData: { email: string; password: string; name?: string }): Promise<{ user: any; tokens: AuthTokens }> {
    // Create user
    const user = await userService.createUser(userData);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store refresh token
    await this.storeRefreshToken(tokens.refreshToken, user.id);

    // Generate email verification token
    await this.generateEmailVerificationToken(user.id);

    return { user, tokens };
  }

  // Refresh access token
  async refreshToken(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const storedToken = this.getDb().data.refreshTokens.find(
      t => t.token === refreshToken && t.userId === payload.sub && !t.isRevoked
    );

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      // Mark token as revoked
      storedToken.isRevoked = true;
      storedToken.revokedAt = new Date();
      await database.getDb().write();
      throw new Error('Refresh token expired');
    }

    // Get user
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }

    // Revoke old refresh token
    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store new refresh token
    await this.storeRefreshToken(tokens.refreshToken, user.id, userAgent, ipAddress);

    return tokens;
  }

  // Logout user
  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      const token = this.getDb().data.refreshTokens.find(t => t.token === refreshToken);
      if (token) {
        token.isRevoked = true;
        token.revokedAt = new Date();
        await database.getDb().write();
      }
    } else if (userId) {
      // Revoke all refresh tokens for user
      const userTokens = this.getDb().data.refreshTokens.filter(t => t.userId === userId && !t.isRevoked);
      userTokens.forEach(token => {
        token.isRevoked = true;
        token.revokedAt = new Date();
      });
      await database.getDb().write();
    }
  }

  // Generate access and refresh tokens
  private async generateTokens(userId: string, email: string, rememberMe: boolean = false): Promise<AuthTokens> {
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiry = rememberMe ? 60 * 60 * 24 * 7 : 60 * 15; // 7 days or 15 minutes
    const refreshTokenExpiry = 60 * 60 * 24 * 30; // 30 days

    // Generate access token
    const accessTokenPayload: TokenPayload = {
      sub: userId,
      email,
      iat: now,
      exp: now + accessTokenExpiry,
      type: 'access',
      jti: uuidv4(),
    };

    const accessToken = jwt.sign(accessTokenPayload, config.JWT_SECRET);

    // Generate refresh token
    const refreshTokenPayload: TokenPayload = {
      sub: userId,
      email,
      iat: now,
      exp: now + refreshTokenExpiry,
      type: 'refresh',
      jti: uuidv4(),
    };

    const refreshToken = jwt.sign(refreshTokenPayload, config.JWT_REFRESH_SECRET);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry,
    };
  }

  // Store refresh token in database
  private async storeRefreshToken(token: string, userId: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const payload = this.verifyRefreshToken(token);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const refreshToken: RefreshToken = {
      id: uuidv4(),
      userId,
      token,
      expiresAt: new Date(payload.exp * 1000),
      createdAt: new Date(),
      userAgent,
      ipAddress,
      isRevoked: false,
    };

    this.getDb().data.refreshTokens.push(refreshToken);
    await database.getDb().write();
  }

  // Verify access token
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
      if (payload.type !== 'access') {
        return null;
      }
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
      if (payload.type !== 'refresh') {
        return null;
      }
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Generate password reset token
  async generatePasswordResetToken(email: string, ipAddress?: string): Promise<string> {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return 'token-generated';
    }

    const token = generatePasswordResetToken();
    const expiresAt = addDays(new Date(), 1); // 24 hours

    const passwordResetToken: PasswordResetToken = {
      id: uuidv4(),
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date(),
      ipAddress,
    };

    this.getDb().data.passwordResetTokens.push(passwordResetToken);
    await database.getDb().write();

    return token;
  }

  // Verify password reset token
  async verifyPasswordResetToken(token: string): Promise<string | null> {
    const resetToken = this.getDb().data.passwordResetTokens.find(
      t => t.token === token && new Date() < t.expiresAt && !t.usedAt
    );

    if (!resetToken) {
      return null;
    }

    return resetToken.userId;
  }

  // Use password reset token
  async usePasswordResetToken(token: string, newPassword: string): Promise<void> {
    const resetToken = this.getDb().data.passwordResetTokens.find(
      t => t.token === token && new Date() < t.expiresAt && !t.usedAt
    );

    if (!resetToken) {
      throw new Error('Invalid or expired password reset token');
    }

    // Update user password
    await userService.changePassword(resetToken.userId, {
      currentPassword: '', // Skip current password check for reset
      newPassword,
    });

    // Mark token as used
    resetToken.usedAt = new Date();
    await database.getDb().write();
  }

  // Generate email verification token
  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = generateEmailVerificationToken();
    const expiresAt = addDays(new Date(), 7); // 7 days

    const emailVerificationToken: EmailVerificationToken = {
      id: uuidv4(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };

    this.getDb().data.emailVerificationTokens.push(emailVerificationToken);
    await database.getDb().write();

    return token;
  }

  // Verify email verification token
  async verifyEmailToken(token: string): Promise<string | null> {
    const verificationToken = this.getDb().data.emailVerificationTokens.find(
      t => t.token === token && new Date() < t.expiresAt && !t.verifiedAt
    );

    if (!verificationToken) {
      return null;
    }

    return verificationToken.userId;
  }

  // Use email verification token
  async useEmailVerificationToken(token: string): Promise<void> {
    const verificationToken = this.getDb().data.emailVerificationTokens.find(
      t => t.token === token && new Date() < t.expiresAt && !t.verifiedAt
    );

    if (!verificationToken) {
      throw new Error('Invalid or expired email verification token');
    }

    // Mark email as verified
    await userService.markEmailVerified(verificationToken.userId);

    // Mark token as used
    verificationToken.verifiedAt = new Date();
    await database.getDb().write();
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    // Clean up expired refresh tokens
    this.getDb().data.refreshTokens = this.getDb().data.refreshTokens.filter(
      t => t.expiresAt > now && !t.isRevoked
    );

    // Clean up expired password reset tokens
    this.getDb().data.passwordResetTokens = this.getDb().data.passwordResetTokens.filter(
      t => t.expiresAt > now
    );

    // Clean up expired email verification tokens
    this.getDb().data.emailVerificationTokens = this.getDb().data.emailVerificationTokens.filter(
      t => t.expiresAt > now
    );

    await database.getDb().write();
  }
}

// Export singleton instance
export const authService = new AuthService();
