'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MarketingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/marketing/campaigns');
  }, [router]);

  return null;
}
