import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { ensureDir, copyFile } from 'fs-extra';
import { DatabaseSchema } from '../src/database/connection';

async function backupDatabase() {
  try {
    console.log('💾 데이터베이스 백업을 시작합니다...');

    const dataDir = join(process.cwd(), 'data');
    const backupDir = join(process.cwd(), 'backups');
    const dbFile = join(dataDir, 'db.json');

    // Ensure directories exist
    await ensureDir(dataDir);
    await ensureDir(backupDir);

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(backupDir, `db-backup-${timestamp}.json`);

    // Copy database file
    await copyFile(dbFile, backupFile);

    console.log('✅ 데이터베이스 백업 완료!');
    console.log('📁 백업 파일:', backupFile);
  } catch (error) {
    console.error('❌ 데이터베이스 백업 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

async function restoreDatabase(backupFile: string) {
  try {
    console.log('🔄 데이터베이스 복원을 시작합니다...');

    const dataDir = join(process.cwd(), 'data');
    const dbFile = join(dataDir, 'db.json');

    // Ensure data directory exists
    await ensureDir(dataDir);

    // Copy backup file to database location
    await copyFile(backupFile, dbFile);

    console.log('✅ 데이터베이스 복원 완료!');
    console.log('📁 복원된 파일:', dbFile);
  } catch (error) {
    console.error('❌ 데이터베이스 복원 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

async function showDatabaseStats() {
  try {
    console.log('📊 데이터베이스 통계를 조회합니다...');

    const dataDir = join(process.cwd(), 'data');
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

    console.log('📈 데이터베이스 통계:');
    console.log('   - 총 사용자 수:', db.data.users.length);
    console.log('   - 활성 사용자 수:', db.data.users.filter(u => u.isActive).length);
    console.log('   - 이메일 인증된 사용자 수:', db.data.users.filter(u => u.emailVerified).length);
    console.log('   - 활성 리프레시 토큰 수:', db.data.refreshTokens.filter(t => !t.isRevoked).length);
    console.log('   - 만료된 리프레시 토큰 수:', db.data.refreshTokens.filter(t => t.isRevoked).length);
    console.log('   - 비밀번호 재설정 토큰 수:', db.data.passwordResetTokens.length);
    console.log('   - 이메일 인증 토큰 수:', db.data.emailVerificationTokens.length);
    console.log('   - 데이터베이스 버전:', db.data.metadata.version);
    console.log('   - 마지막 마이그레이션:', db.data.metadata.lastMigration);
  } catch (error) {
    console.error('❌ 데이터베이스 통계 조회 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

async function cleanExpiredTokens() {
  try {
    console.log('🧹 만료된 토큰 정리를 시작합니다...');

    const dataDir = join(process.cwd(), 'data');
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

    const now = new Date();
    let cleanedCount = 0;

    // Clean expired refresh tokens
    const initialRefreshTokens = db.data.refreshTokens.length;
    db.data.refreshTokens = db.data.refreshTokens.filter(
      token => token.expiresAt > now && !token.isRevoked
    );
    cleanedCount += initialRefreshTokens - db.data.refreshTokens.length;

    // Clean expired password reset tokens
    const initialPasswordResetTokens = db.data.passwordResetTokens.length;
    db.data.passwordResetTokens = db.data.passwordResetTokens.filter(
      token => token.expiresAt > now
    );
    cleanedCount += initialPasswordResetTokens - db.data.passwordResetTokens.length;

    // Clean expired email verification tokens
    const initialEmailVerificationTokens = db.data.emailVerificationTokens.length;
    db.data.emailVerificationTokens = db.data.emailVerificationTokens.filter(
      token => token.expiresAt > now
    );
    cleanedCount += initialEmailVerificationTokens - db.data.emailVerificationTokens.length;

    await db.write();

    console.log('✅ 만료된 토큰 정리 완료!');
    console.log('🗑️  삭제된 토큰 수:', cleanedCount);
  } catch (error) {
    console.error('❌ 토큰 정리 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const backupFile = args[1];

  switch (command) {
    case 'backup':
      backupDatabase();
      break;
    case 'restore':
      if (!backupFile) {
        console.error('❌ 백업 파일 경로를 지정해주세요.');
        console.log('사용법: npm run db:restore <backup-file-path>');
        process.exit(1);
      }
      restoreDatabase(backupFile);
      break;
    case 'stats':
      showDatabaseStats();
      break;
    case 'clean':
      cleanExpiredTokens();
      break;
    default:
      console.log('사용 가능한 명령어:');
      console.log('  backup  - 데이터베이스 백업');
      console.log('  restore - 데이터베이스 복원');
      console.log('  stats   - 데이터베이스 통계 조회');
      console.log('  clean   - 만료된 토큰 정리');
      break;
  }
}

export { backupDatabase, restoreDatabase, showDatabaseStats, cleanExpiredTokens };
