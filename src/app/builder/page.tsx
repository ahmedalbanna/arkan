
'use client';

import { formatDistanceToNow } from 'date-fns';
import dynamic from 'next/dynamic';
import { useBuilderPageLogic } from '@/hooks/core/use-builder-page';
import { Input } from '@/components/ui/input';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { BuilderPageSkeleton } from './loading';
import { useSaveProject } from '@/hooks';

const SessionActions = dynamic(() => import('@/components/project/SessionActions').then(mod => ({ default: mod.SessionActions })), {
  ssr: false,
  loading: () => <div className="h-8 w-[400px] bg-muted rounded-md" />,
});

const ReportGenerator = dynamic(() => import('@/components/report-mode/ReportModeGenerator'), {
  ssr: false,
  loading: () => <BuilderPageSkeleton />,
});

export default function GeneratePage() {
  const {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    project,
    isStoreInitialized,
    updateProjectName,
  } = useBuilderPageLogic();
  
  const { isSaving } = useSaveProject();

  // Show a loading skeleton until the store is initialized from local storage
  if (!isStoreInitialized || !project) {
    return <BuilderPageSkeleton />;
  }

  return (
    <div className="relative flex-grow flex flex-col">
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      <div className="flex-grow flex flex-col mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
          <div className="flex-1 space-y-2 overflow-auto">
            <Input
              className="text-xl font-semibold text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
              value={project?.name || ''}
              onChange={(e) => updateProjectName(e.target.value)}
              placeholder={'Untitled Project'}
            />
            {project?.meta.updated && (
              <p className="text-xs text-muted-foreground pt-1">
                Updated {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
              </p>
            )}
          </div>
          <div className="flex-none">
            <SessionActions isSaving={isSaving} />
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <ReportGenerator />
        </div>
      </div>
    </div>
  );
}
