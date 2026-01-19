'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InventoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/inventory/stock');
  }, [router]);

  return null;
}
