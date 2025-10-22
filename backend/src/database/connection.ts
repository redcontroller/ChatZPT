import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { ensureDir } from 'fs-extra';

// Database schema interface
export interface DatabaseSchema {
  users: User[];
  refreshTokens: RefreshToken[];
  passwordResetTokens: PasswordResetToken[];
  emailVerificationTokens: EmailVerificationToken[];
  metadata: {
    version: string;
    lastMigration: string;
  };
}

// User interface
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  emailVerified: boolean;
  profile: {
    name?: string;
    avatar?: string;
    bio?: string;
    preferences: {
      theme: 'light' | 'dark' | 'system';
      language: 'ko' | 'en';
      notifications: {
        email: boolean;
        push: boolean;
      };
    };
  };
  security: {
    failedLoginAttempts: number;
    lockedUntil?: Date;
    twoFactorEnabled: boolean;
    lastPasswordChange?: Date;
  };
}

// RefreshToken interface
export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
  isRevoked: boolean;
  revokedAt?: Date;
}

// PasswordResetToken interface
export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
  ipAddress?: string;
}

// EmailVerificationToken interface
export interface EmailVerificationToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  verifiedAt?: Date;
}

class Database {
  private db: Low<DatabaseSchema> | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Ensure data directory exists
      const dataDir = join(process.cwd(), 'data');
      await ensureDir(dataDir);

      // Initialize database
      const file = join(dataDir, 'db.json');
      const adapter = new JSONFile<DatabaseSchema>(file);
      
      this.db = new Low(adapter, {
        users: [],
        refreshTokens: [],
        passwordResetTokens: [],
        emailVerificationTokens: [],
        metadata: {
          version: '1.0.0',
          lastMigration: new Date().toISOString(),
        },
      });

      await this.db.read();
      
      // Only write if database is empty (first time initialization)
      if (!this.db.data || this.db.data.users.length === 0) {
        await this.db.write();
        console.log('Database file created with default schema');
      } else {
        console.log('Database loaded with existing data');
      }
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  getDb(): Low<DatabaseSchema> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async cleanup(): Promise<void> {
    if (!this.db) return;

    const now = new Date();
    
    // Clean up expired refresh tokens
    this.db.data.refreshTokens = this.db.data.refreshTokens.filter(
      token => token.expiresAt > now && !token.isRevoked
    );
    
    // Clean up expired password reset tokens
    this.db.data.passwordResetTokens = this.db.data.passwordResetTokens.filter(
      token => token.expiresAt > now
    );
    
    // Clean up expired email verification tokens
    this.db.data.emailVerificationTokens = this.db.data.emailVerificationTokens.filter(
      token => token.expiresAt > now
    );
    
    await this.db.write();
  }

  async backup(): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(process.cwd(), 'backups', `db-backup-${timestamp}.json`);
    
    // Ensure backups directory exists
    await ensureDir(join(process.cwd(), 'backups'));
    
    // Copy current database file
    const fs = await import('fs-extra');
    await fs.copyFile(join(process.cwd(), 'data', 'db.json'), backupPath);
    
    return backupPath;
  }
}

// Singleton instance
const database = new Database();

export default database;
