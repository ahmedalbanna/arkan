
'use client';

import { LayoutGrid } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const UIAgentSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
        <div className="lg:col-span-9">
            <Card>
                 <CardHeader>
                     <Skeleton className="h-6 w-1/4" />
                 </CardHeader>
                 <CardContent>
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-[50vh] w-full" />
                 </CardContent>
            </Card>
        </div>
    </div>
);

const UIAgent = dynamic(() => import('@/components/ui-agent/UIAgent'), { 
    ssr: false,
    loading: () => <UIAgentSkeleton />,
});

export default function UIAgentPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <LayoutGrid className="w-10 h-10" />
          UI Agent
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Describe the UI you want to build, and let the AI generate it for you.
        </p>
      </div>
      <UIAgent />
    </div>
  );
}
