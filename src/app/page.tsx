
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HomePageContent = dynamic(() => import('@/components/HomePageContent'), {
  ssr: false,
  loading: () => <Skeleton className="h-[80vh] w-full" />,
});

export default function Home() {
  return <HomePageContent featuredProjects={[]} />;
}
