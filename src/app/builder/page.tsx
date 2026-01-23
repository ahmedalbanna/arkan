'use client';

import ReportModeGenerator from '@/components/report-mode/ReportModeGenerator';
import { BuilderPageSkeleton } from './loading';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function GeneratePage() {
  // The main page now wraps the ReportModeGenerator with ErrorBoundary and Suspense
  return (
    <ErrorBoundary>
      <Suspense fallback={<BuilderPageSkeleton />}>
        <ReportModeGenerator />
      </Suspense>
    </ErrorBoundary>
  );
}
