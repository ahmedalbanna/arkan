
'use client';

import OnboardingGuide from '@/components/auth/OnboardingGuide';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useFeatures, useProject } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
const FileManager = dynamic(() => import('@/components/file/FileManager'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});


async function markOnboardingComplete(userId: string, token: string) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ hasCompletedOnboarding: true })
  });
  if (!response.ok) {
    throw new Error('Failed to update onboarding status');
  }
  return response.json();
}

function GeneratePageContent() {
  const {
    activeTab,
    setActiveTab,
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    t,
    locale,
    project,
    projectData,
    enabledTabs,
    featuresLoaded,
    isFeatureEnabled,
  } = useBuilderPageLogic();
  const [isClient, setIsClient] = useState(false);
  const { updateProject } = useBuilderStore();


  useEffect(() => {
    setIsClient(true);
  }, []);



  // hook provides tab enabling and activeTab upkeep

  return (
    <div className="relative flex-grow flex flex-col">
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      <div className="flex-grow flex flex-col mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
          <div className="flex-1 space-y-2 overflow-auto">
            {!isClient ? (
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
                  onChange={(e) => updateProject(p => { p.name = e.target.value; })}
                  placeholder={t('projects.untitled')}
                />
                 <Textarea
                  className="text-sm text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto resize-none"
                  value={project?.projectDescription || ''}
                  onChange={(e) => updateProject(p => { p.projectDescription = e.target.value; })}
                  placeholder={t('projects.noDescription')}
                />
                {projectData?.updatedAt && (
                  <p className="text-xs text-muted-foreground pt-1">
                    {t('projects.updated', { time: formatDistanceToNow(new Date(projectData.updatedAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS }) })}
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
          {!featuresLoaded ? (
            <LoadingSkeleton />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
              <TabsList className="grid w-full h-auto grid-cols-2">
                <TabsTrigger value="files" className="gap-2">
                  <FolderKanban className="h-4 w-4" /> {t('builder.files.fileManagerTitle')}
                </TabsTrigger>
                {isFeatureEnabled('report') && (
                  <TabsTrigger value="report" className="gap-2">
                    <FileText className="h-4 w-4" /> {t('builder.tabs.document')}
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="w-full flex-grow mt-4">
                <TabsContent value="files" className="h-full animate-fade-in">
                  {activeTab === 'files' && <FileManager />}
                </TabsContent>
                <TabsContent value="report" className="h-full animate-fade-in">
                  {activeTab === 'report' && <ReportGenerator />}
                </TabsContent>
              </div>
            </Tabs>
          )}
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
