'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RevenuePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/revenue/daily');
  }, [router]);

  return null;
}
