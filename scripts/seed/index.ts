/**
 * VIBE DBA Portal - Database Seed Runner
 *
 * 사용법:
 *   npm run seed           # 모든 데이터베이스 시드
 *   npm run seed:auth      # Auth 데이터베이스만 시드
 *   npm run seed:hr        # HR 데이터베이스만 시드
 *   npm run seed:inventory # Inventory 데이터베이스만 시드
 *   npm run seed:marketing # Marketing 데이터베이스만 시드
 *
 * 주의: 프로덕션 환경에서는 사용하지 마세요!
 */

import { execSync } from 'child_process';
import path from 'path';

const services = ['auth', 'hr', 'inventory', 'marketing'];

async function runSeed(service: string) {
  const seedPath = path.join(__dirname, `${service}-seed.ts`);
  const servicePath = path.join(__dirname, '../../services', `${service}-service`);

  console.log(`\n📦 Running seed for ${service}-service...`);

  try {
    execSync(`cd ${servicePath} && npx ts-node ${seedPath}`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (error) {
    console.error(`Failed to seed ${service}-service`);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const targetService = args[0];

  console.log('🌱 VIBE DBA Portal - Database Seeder');
  console.log('=====================================');

  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot run seeds in production environment!');
    process.exit(1);
  }

  if (targetService) {
    if (!services.includes(targetService)) {
      console.error(`❌ Unknown service: ${targetService}`);
      console.log(`Available services: ${services.join(', ')}`);
      process.exit(1);
    }
    await runSeed(targetService);
  } else {
    console.log('Seeding all services...');
    for (const service of services) {
      await runSeed(service);
    }
  }

  console.log('\n✅ All seeds completed successfully!');
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
