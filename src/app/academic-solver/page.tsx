'use client';

import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { BrainCircuit } from 'lucide-react';

const AcademicSolver = lazy(() => import('@/components/academic-solver/AcademicSolver'));

function AcademicSolverSkeleton() {
  return (
    <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    </div>
  );
}


export default function AcademicSolverPage() {
  const { t } = useLocalization();
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <BrainCircuit className="w-10 h-10" />
          {t('academicSolver.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('academicSolver.pageSubtitle')}
        </p>
      </div>
       <Suspense fallback={<AcademicSolverSkeleton />}>
        <AcademicSolver />
      </Suspense>
    </div>
  );
}
