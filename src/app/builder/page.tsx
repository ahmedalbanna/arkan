'use client';

import OnboardingGuide from '@/components/auth/OnboardingGuide';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { FileText, FolderKanban } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useBuilderPageLogic } from '@/hooks/core/use-builder-page';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-[calc(100vh-300px)] w-full" />
  </div>
);

const SessionActions = dynamic(() => import('@/components/project/SessionActions').then(mod => mod.SessionActions), {
  ssr: false,
  loading: () => <Skeleton className="h-8 w-[400px]" />,
});


const ReportGenerator = dynamic(() => import('@/components/report-mode/ReportModeGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

function GeneratePageContent() {
  const {

    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    t,
    locale,
    project,
    isLoadingProject,


    updateProjectName,
  } = useBuilderPageLogic();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative flex-grow flex flex-col">
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      <div className="flex-grow flex flex-col mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
          <div className="flex-1 space-y-2 overflow-auto">
            {!isClient || isLoadingProject ? (
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <Input
                  className="text-xl font-semibold text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                  value={project?.name || ''}
                  onChange={(e) => updateProjectName(e.target.value)}
                  placeholder={t('projects.untitled')}
                />
                {project?.updatedAt && (
                  <p className="text-xs text-muted-foreground pt-1">
                    {t('projects.updated', { time: formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS }) })}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex-none">
            <SessionActions />
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <ReportGenerator />
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <GeneratePageContent />
  )
}
