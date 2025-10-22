import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { ensureDir } from 'fs-extra';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseSchema, User } from '../src/database/connection';
// import config from '../src/config';

async function seedDatabase() {
  try {
    console.log('🌱 데이터베이스 시드 생성을 시작합니다...');

    const dataDir = join(process.cwd(), 'data');
    await ensureDir(dataDir);

    const file = join(dataDir, 'db.json');
    const adapter = new JSONFile<DatabaseSchema>(file);
    
    const db = new Low(adapter, {
      users: [],
      refreshTokens: [],
      passwordResetTokens: [],
      emailVerificationTokens: [],
      metadata: {
        version: '1.0.0',
        lastMigration: new Date().toISOString(),
      },
    });
    await db.read();

    // Check if database already has data
    if (db.data.users.length > 0) {
      console.log('⚠️  데이터베이스에 이미 데이터가 있습니다. 시드를 건너뜁니다.');
      console.log('   기존 데이터를 삭제하려면 먼저 "npm run db:reset"을 실행하세요.');
      return;
    }

    console.log('👤 테스트 사용자 생성 중...');

    // Create test users
    const testUsers: User[] = [
      {
        id: uuidv4(),
        email: 'admin@chatzpt.com',
        passwordHash: await bcrypt.hash('Admin123!', 12),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: true,
        profile: {
          name: '관리자',
          avatar: '',
          bio: 'ChatZPT 관리자 계정입니다.',
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
      },
      {
        id: uuidv4(),
        email: 'user@chatzpt.com',
        passwordHash: await bcrypt.hash('User123!', 12),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: true,
        profile: {
          name: '일반 사용자',
          avatar: '',
          bio: 'ChatZPT 일반 사용자 계정입니다.',
          preferences: {
            theme: 'light',
            language: 'ko',
            notifications: {
              email: true,
              push: false,
            },
          },
        },
        security: {
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
        },
      },
      {
        id: uuidv4(),
        email: 'test@chatzpt.com',
        passwordHash: await bcrypt.hash('Test123!', 12),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: false,
        profile: {
          name: '테스트 사용자',
          avatar: '',
          bio: '이메일 인증이 필요한 테스트 계정입니다.',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: {
              email: false,
              push: true,
            },
          },
        },
        security: {
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
        },
      },
    ];

    // Add users to database
    db.data.users = testUsers;

    // Update metadata
    db.data.metadata.lastMigration = new Date().toISOString();

    await db.write();

    console.log('✅ 시드 데이터 생성 완료!');
    console.log('📊 생성된 테스트 사용자:');
    console.log('');
    console.log('🔑 관리자 계정:');
    console.log('   이메일: admin@chatzpt.com');
    console.log('   비밀번호: Admin123!');
    console.log('   상태: 활성, 이메일 인증됨');
    console.log('');
    console.log('👤 일반 사용자 계정:');
    console.log('   이메일: user@chatzpt.com');
    console.log('   비밀번호: User123!');
    console.log('   상태: 활성, 이메일 인증됨');
    console.log('');
    console.log('🧪 테스트 계정:');
    console.log('   이메일: test@chatzpt.com');
    console.log('   비밀번호: Test123!');
    console.log('   상태: 활성, 이메일 미인증');
    console.log('');
    console.log('💡 이제 애플리케이션을 시작하고 위 계정들로 로그인할 수 있습니다!');
  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
