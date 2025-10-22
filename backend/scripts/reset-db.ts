import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { ensureDir, remove } from 'fs-extra';
import { DatabaseSchema } from '../src/database/connection';

async function resetDatabase() {
  try {
    console.log('🔄 데이터베이스 리셋을 시작합니다...');

    const dataDir = join(process.cwd(), 'data');
    const file = join(dataDir, 'db.json');

    // Remove existing database file
    try {
      await remove(file);
      console.log('✅ 기존 데이터베이스 파일 삭제 완료');
    } catch (error) {
      console.log('ℹ️  기존 데이터베이스 파일이 없습니다');
    }

    // Ensure data directory exists
    await ensureDir(dataDir);
    console.log('✅ 데이터 디렉토리 확인 완료');

    // Initialize fresh database
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
    
    console.log('✅ 새로운 데이터베이스 파일 생성 완료:', file);
    console.log('📊 초기 데이터베이스 구조:');
    console.log('   - users: []');
    console.log('   - refreshTokens: []');
    console.log('   - passwordResetTokens: []');
    console.log('   - emailVerificationTokens: []');
    console.log('   - metadata: { version: "1.0.0", lastMigration: "' + new Date().toISOString() + '" }');
    
    console.log('🎉 데이터베이스 리셋이 완료되었습니다!');
  } catch (error) {
    console.error('❌ 데이터베이스 리셋 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase();
}

export default resetDatabase;
