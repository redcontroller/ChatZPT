import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { ensureDir } from 'fs-extra';
import { DatabaseSchema } from '../src/database/connection';

async function initializeDatabase() {
  try {
    console.log('🚀 데이터베이스 초기화를 시작합니다...');

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    await ensureDir(dataDir);
    console.log('✅ 데이터 디렉토리 생성 완료:', dataDir);

    // Initialize database
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
    await db.write();
    
    console.log('✅ 데이터베이스 파일 생성 완료:', file);
    console.log('📊 초기 데이터베이스 구조:');
    console.log('   - users: []');
    console.log('   - refreshTokens: []');
    console.log('   - passwordResetTokens: []');
    console.log('   - emailVerificationTokens: []');
    console.log('   - metadata: { version: "1.0.0", lastMigration: "' + new Date().toISOString() + '" }');
    
    console.log('🎉 데이터베이스 초기화가 완료되었습니다!');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
