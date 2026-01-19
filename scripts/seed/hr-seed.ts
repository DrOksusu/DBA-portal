import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HR database...');

  const clinicId = 'clinic-001';

  // Create employees
  const employees = [
    {
      id: 'emp-001',
      clinicId,
      employeeNumber: 'EMP001',
      name: '김영희',
      position: '원장',
      department: '진료',
      email: 'kim@vibe-dental.com',
      phone: '010-1234-5678',
      hireDate: new Date('2020-03-15'),
      status: 'ACTIVE' as const,
      employmentType: 'FULL_TIME' as const,
      baseSalary: 8000000,
    },
    {
      id: 'emp-002',
      clinicId,
      employeeNumber: 'EMP002',
      name: '이철수',
      position: '치과의사',
      department: '진료',
      email: 'lee@vibe-dental.com',
      phone: '010-2345-6789',
      hireDate: new Date('2021-06-01'),
      status: 'ACTIVE' as const,
      employmentType: 'FULL_TIME' as const,
      baseSalary: 6000000,
    },
    {
      id: 'emp-003',
      clinicId,
      employeeNumber: 'EMP003',
      name: '박미정',
      position: '치위생사',
      department: '진료지원',
      email: 'park@vibe-dental.com',
      phone: '010-3456-7890',
      hireDate: new Date('2022-01-10'),
      status: 'ACTIVE' as const,
      employmentType: 'FULL_TIME' as const,
      baseSalary: 3200000,
    },
    {
      id: 'emp-004',
      clinicId,
      employeeNumber: 'EMP004',
      name: '정수진',
      position: '간호조무사',
      department: '진료지원',
      email: 'jung@vibe-dental.com',
      phone: '010-4567-8901',
      hireDate: new Date('2022-08-20'),
      status: 'ACTIVE' as const,
      employmentType: 'FULL_TIME' as const,
      baseSalary: 2800000,
    },
    {
      id: 'emp-005',
      clinicId,
      employeeNumber: 'EMP005',
      name: '최민호',
      position: '데스크',
      department: '행정',
      email: 'choi@vibe-dental.com',
      phone: '010-5678-9012',
      hireDate: new Date('2023-02-01'),
      status: 'ACTIVE' as const,
      employmentType: 'PART_TIME' as const,
      baseSalary: 1800000,
    },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: emp,
    });
    console.log(`  ✓ Created employee: ${emp.name} (${emp.position})`);
  }

  // Create incentive policy
  const policy = await prisma.incentivePolicy.upsert({
    where: { id: 'policy-001' },
    update: {},
    create: {
      id: 'policy-001',
      clinicId,
      name: '기본 인센티브',
      policyType: 'PERCENTAGE',
      value: 5,
      minAchievementRate: 100,
      isDefault: true,
      isActive: true,
    },
  });

  console.log(`  ✓ Created incentive policy: ${policy.name}`);

  // Create target revenues for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const targets = [
    { employeeId: 'emp-001', targetAmount: 50000000 },
    { employeeId: 'emp-002', targetAmount: 35000000 },
    { employeeId: 'emp-003', targetAmount: 8000000 },
  ];

  for (const target of targets) {
    await prisma.targetRevenue.upsert({
      where: {
        employeeId_year_month: {
          employeeId: target.employeeId,
          year,
          month,
        },
      },
      update: {},
      create: {
        clinicId,
        employeeId: target.employeeId,
        year,
        month,
        targetAmount: target.targetAmount,
      },
    });
  }

  console.log(`  ✓ Created ${targets.length} target revenues for ${year}-${month}`);

  console.log('✅ HR database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
