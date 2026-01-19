import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Marketing database...');

  const clinicId = 'clinic-001';

  // Create campaigns
  const now = new Date();
  const campaigns = [
    {
      id: 'camp-001',
      clinicId,
      name: '신년 임플란트 할인 이벤트',
      type: 'EVENT' as const,
      status: 'ACTIVE' as const,
      budget: 5000000,
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 0, 31),
      targetPatients: 50,
      description: '새해를 맞아 임플란트 20% 할인 이벤트',
    },
    {
      id: 'camp-002',
      clinicId,
      name: '네이버 검색광고',
      type: 'SEARCH' as const,
      status: 'ACTIVE' as const,
      budget: 2000000,
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 2, 31),
      targetPatients: 30,
      description: '네이버 키워드 광고 (치과, 임플란트, 교정)',
    },
    {
      id: 'camp-003',
      clinicId,
      name: '인스타그램 프로모션',
      type: 'SNS' as const,
      status: 'ACTIVE' as const,
      budget: 1500000,
      startDate: new Date(now.getFullYear(), 0, 15),
      endDate: new Date(now.getFullYear(), 1, 15),
      targetPatients: 20,
      description: '인스타그램 광고 및 인플루언서 협업',
    },
    {
      id: 'camp-004',
      clinicId,
      name: '지역 전단지 배포',
      type: 'OFFLINE' as const,
      status: 'COMPLETED' as const,
      budget: 500000,
      startDate: new Date(now.getFullYear() - 1, 11, 1),
      endDate: new Date(now.getFullYear() - 1, 11, 31),
      targetPatients: 15,
      description: '강남구 주요 아파트 단지 전단지 배포',
    },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.upsert({
      where: { id: campaign.id },
      update: {},
      create: campaign,
    });
    console.log(`  ✓ Created campaign: ${campaign.name}`);
  }

  // Create marketing expenses
  const expenses = [
    { campaignId: 'camp-001', amount: 3200000, category: 'ADVERTISING', description: '이벤트 홍보물 제작' },
    { campaignId: 'camp-002', amount: 1800000, category: 'ADVERTISING', description: '네이버 광고비 (1월)' },
    { campaignId: 'camp-003', amount: 800000, category: 'ADVERTISING', description: '인스타그램 광고비' },
    { campaignId: 'camp-003', amount: 500000, category: 'INFLUENCER', description: '인플루언서 협찬' },
    { campaignId: 'camp-004', amount: 500000, category: 'PRINT', description: '전단지 인쇄 및 배포' },
  ];

  for (const expense of expenses) {
    await prisma.marketingExpense.create({
      data: {
        clinicId,
        ...expense,
        expenseDate: new Date(),
      },
    });
  }

  console.log(`  ✓ Created ${expenses.length} marketing expenses`);

  // Create campaign performance data
  const performances = [
    { campaignId: 'camp-001', date: new Date(), impressions: 50000, clicks: 2500, conversions: 35, revenue: 45000000 },
    { campaignId: 'camp-002', date: new Date(), impressions: 100000, clicks: 5000, conversions: 28, revenue: 18000000 },
    { campaignId: 'camp-003', date: new Date(), impressions: 80000, clicks: 4000, conversions: 12, revenue: 8500000 },
    { campaignId: 'camp-004', date: new Date(), impressions: 10000, clicks: 500, conversions: 18, revenue: 12000000 },
  ];

  for (const perf of performances) {
    await prisma.campaignPerformance.create({
      data: perf,
    });
  }

  console.log(`  ✓ Created ${performances.length} campaign performances`);

  // Create patient sources
  const patientSources = [
    { source: 'NAVER_SEARCH', count: 45 },
    { source: 'INSTAGRAM', count: 28 },
    { source: 'REFERRAL', count: 52 },
    { source: 'FLYER', count: 12 },
    { source: 'KAKAO', count: 18 },
    { source: 'OTHER', count: 15 },
  ];

  for (const ps of patientSources) {
    await prisma.patientSource.create({
      data: {
        clinicId,
        ...ps,
        recordDate: new Date(),
      },
    });
  }

  console.log(`  ✓ Created ${patientSources.length} patient sources`);

  console.log('✅ Marketing database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
