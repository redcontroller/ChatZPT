import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { ensureDir } from 'fs-extra';
import { DatabaseSchema } from '../src/database/connection';

interface Migration {
  version: string;
  name: string;
  up: (db: Low<DatabaseSchema>) => Promise<void>;
  down: (db: Low<DatabaseSchema>) => Promise<void>;
}

// Define migrations
const migrations: Migration[] = [
  {
    version: '1.0.0',
    name: 'Initial database schema',
    up: async (db) => {
      // Initial schema is already set in the database connection
      console.log('✅ Migration 1.0.0: Initial schema applied');
    },
    down: async (db) => {
      // Reset to empty state
      db.data = {
        users: [],
        refreshTokens: [],
        passwordResetTokens: [],
        emailVerificationTokens: [],
        metadata: {
          version: '0.0.0',
          lastMigration: new Date().toISOString(),
        },
      };
      console.log('✅ Migration 1.0.0: Reverted');
    },
  },
  // Future migrations can be added here
  // {
  //   version: '1.1.0',
  //   name: 'Add user preferences',
  //   up: async (db) => {
  //     // Migration logic here
  //   },
  //   down: async (db) => {
  //     // Rollback logic here
  //   },
  // },
];

async function runMigrations() {
  try {
    console.log('🔄 데이터베이스 마이그레이션을 시작합니다...');

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
        version: '0.0.0',
        lastMigration: new Date().toISOString(),
      },
    });

    await db.read();

    const currentVersion = db.data.metadata.version;
    console.log('📊 현재 데이터베이스 버전:', currentVersion);

    // Find migrations to run
    const migrationsToRun = migrations.filter(migration => 
      migration.version > currentVersion
    );

    if (migrationsToRun.length === 0) {
      console.log('✅ 모든 마이그레이션이 최신 상태입니다.');
      return;
    }

    console.log(`📋 실행할 마이그레이션: ${migrationsToRun.length}개`);

    // Run migrations
    for (const migration of migrationsToRun) {
      console.log(`🔄 마이그레이션 실행 중: ${migration.version} - ${migration.name}`);
      
      try {
        await migration.up(db);
        db.data.metadata.version = migration.version;
        db.data.metadata.lastMigration = new Date().toISOString();
        await db.write();
        
        console.log(`✅ 마이그레이션 완료: ${migration.version}`);
      } catch (error) {
        console.error(`❌ 마이그레이션 실패: ${migration.version}`, error);
        throw error;
      }
    }

    console.log('🎉 모든 마이그레이션이 완료되었습니다!');
    console.log('📊 최종 데이터베이스 버전:', db.data.metadata.version);
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

async function rollbackMigration(version: string) {
  try {
    console.log(`🔄 마이그레이션 롤백을 시작합니다: ${version}`);

    const dataDir = join(process.cwd(), 'data');
    const file = join(dataDir, 'db.json');
    const adapter = new JSONFile<DatabaseSchema>(file);
    
    const db = new Low(adapter);
    await db.read();

    const migration = migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`마이그레이션을 찾을 수 없습니다: ${version}`);
    }

    console.log(`🔄 롤백 실행 중: ${migration.version} - ${migration.name}`);
    await migration.down(db);
    
    // Update version to previous migration or 0.0.0
    const previousMigration = migrations
      .filter(m => m.version < version)
      .sort((a, b) => b.version.localeCompare(a.version))[0];
    
    db.data.metadata.version = previousMigration?.version || '0.0.0';
    db.data.metadata.lastMigration = new Date().toISOString();
    await db.write();

    console.log(`✅ 롤백 완료: ${version}`);
    console.log('📊 현재 데이터베이스 버전:', db.data.metadata.version);
  } catch (error) {
    console.error('❌ 롤백 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const version = args[1];

  if (command === 'rollback' && version) {
    rollbackMigration(version);
  } else {
    runMigrations();
  }
}

export { runMigrations, rollbackMigration };
