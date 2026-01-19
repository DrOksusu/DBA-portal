import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Auth database...');

  // Create sample clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'clinic-001' },
    update: {},
    create: {
      id: 'clinic-001',
      name: 'VIBE 치과의원',
      businessNumber: '123-45-67890',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'contact@vibe-dental.com',
    },
  });

  console.log(`  ✓ Created clinic: ${clinic.name}`);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibe-dental.com' },
    update: {},
    create: {
      email: 'admin@vibe-dental.com',
      password: hashedPassword,
      name: '관리자',
      role: 'ADMIN',
      clinicId: clinic.id,
    },
  });

  console.log(`  ✓ Created admin user: ${admin.email}`);

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@vibe-dental.com' },
    update: {},
    create: {
      email: 'manager@vibe-dental.com',
      password: hashedPassword,
      name: '매니저',
      role: 'MANAGER',
      clinicId: clinic.id,
    },
  });

  console.log(`  ✓ Created manager user: ${manager.email}`);

  // Create staff user
  const staff = await prisma.user.upsert({
    where: { email: 'staff@vibe-dental.com' },
    update: {},
    create: {
      email: 'staff@vibe-dental.com',
      password: hashedPassword,
      name: '직원',
      role: 'STAFF',
      clinicId: clinic.id,
    },
  });

  console.log(`  ✓ Created staff user: ${staff.email}`);

  console.log('✅ Auth database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
