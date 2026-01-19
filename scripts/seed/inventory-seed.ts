import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Inventory database...');

  const clinicId = 'clinic-001';

  // Create suppliers
  const suppliers = [
    {
      id: 'sup-001',
      clinicId,
      name: '의료용품상사',
      contactPerson: '김상사',
      phone: '02-1234-5678',
      email: 'contact@medical.co.kr',
      address: '서울시 강남구 테헤란로 123',
    },
    {
      id: 'sup-002',
      clinicId,
      name: '덴탈플러스',
      contactPerson: '이플러스',
      phone: '02-2345-6789',
      email: 'info@dentalplus.com',
      address: '서울시 서초구 서초대로 456',
    },
    {
      id: 'sup-003',
      clinicId,
      name: '덴탈코리아',
      contactPerson: '박코리아',
      phone: '02-3456-7890',
      email: 'sales@dentalkorea.com',
      address: '경기도 성남시 분당구 판교로 789',
    },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: {},
      create: supplier,
    });
    console.log(`  ✓ Created supplier: ${supplier.name}`);
  }

  // Create products
  const products = [
    {
      id: 'prod-001',
      clinicId,
      code: 'PRD001',
      name: '일회용 장갑 (M)',
      category: '소모품',
      description: '라텍스 프리 일회용 장갑 (중)',
      unit: '박스',
      unitPrice: 15000,
      currentStock: 500,
      minStock: 100,
      maxStock: 1000,
    },
    {
      id: 'prod-002',
      clinicId,
      code: 'PRD002',
      name: '마스크 (KF94)',
      category: '소모품',
      description: 'KF94 의료용 마스크',
      unit: '박스',
      unitPrice: 25000,
      currentStock: 80,
      minStock: 100,
      maxStock: 500,
    },
    {
      id: 'prod-003',
      clinicId,
      code: 'PRD003',
      name: '레진 (A2)',
      category: '재료',
      description: '복합레진 A2 색상',
      unit: '개',
      unitPrice: 120000,
      currentStock: 15,
      minStock: 10,
      maxStock: 50,
    },
    {
      id: 'prod-004',
      clinicId,
      code: 'PRD004',
      name: '칫솔 (성인용)',
      category: '구강용품',
      description: '부드러운 모 칫솔',
      unit: '개',
      unitPrice: 3000,
      currentStock: 200,
      minStock: 50,
      maxStock: 300,
    },
    {
      id: 'prod-005',
      clinicId,
      code: 'PRD005',
      name: '치실',
      category: '구강용품',
      description: '왁스 코팅 치실',
      unit: '개',
      unitPrice: 5000,
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
    },
    {
      id: 'prod-006',
      clinicId,
      code: 'PRD006',
      name: '치약 (미백)',
      category: '구강용품',
      description: '미백 효과 치약',
      unit: '개',
      unitPrice: 8000,
      currentStock: 100,
      minStock: 30,
      maxStock: 150,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
    console.log(`  ✓ Created product: ${product.name}`);
  }

  // Link products to suppliers
  const productSuppliers = [
    { productId: 'prod-001', supplierId: 'sup-001', isPreferred: true, supplierProductCode: 'MED-GL-001' },
    { productId: 'prod-001', supplierId: 'sup-002', isPreferred: false, supplierProductCode: 'DP-GLV-M' },
    { productId: 'prod-002', supplierId: 'sup-001', isPreferred: true, supplierProductCode: 'MED-MSK-94' },
    { productId: 'prod-003', supplierId: 'sup-003', isPreferred: true, supplierProductCode: 'DK-RSN-A2' },
    { productId: 'prod-004', supplierId: 'sup-002', isPreferred: true, supplierProductCode: 'DP-TB-AD' },
    { productId: 'prod-005', supplierId: 'sup-002', isPreferred: true, supplierProductCode: 'DP-FLS-01' },
  ];

  for (const ps of productSuppliers) {
    await prisma.productSupplier.upsert({
      where: {
        productId_supplierId: {
          productId: ps.productId,
          supplierId: ps.supplierId,
        },
      },
      update: {},
      create: ps,
    });
  }

  console.log(`  ✓ Linked products to suppliers`);

  // Create initial stock movements
  const movements = [
    { productId: 'prod-001', type: 'IN' as const, quantity: 500, reason: '초기 입고' },
    { productId: 'prod-002', type: 'IN' as const, quantity: 100, reason: '초기 입고' },
    { productId: 'prod-003', type: 'IN' as const, quantity: 20, reason: '초기 입고' },
    { productId: 'prod-004', type: 'IN' as const, quantity: 200, reason: '초기 입고' },
    { productId: 'prod-005', type: 'IN' as const, quantity: 150, reason: '초기 입고' },
    { productId: 'prod-002', type: 'OUT' as const, quantity: 20, reason: '진료 사용' },
    { productId: 'prod-003', type: 'OUT' as const, quantity: 5, reason: '진료 사용' },
  ];

  for (const movement of movements) {
    await prisma.stockMovement.create({
      data: {
        clinicId,
        ...movement,
        performedBy: 'system',
      },
    });
  }

  console.log(`  ✓ Created ${movements.length} stock movements`);

  console.log('✅ Inventory database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
