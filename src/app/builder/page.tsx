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
  const [activeTab, setActiveTab] = useState("files");
  const { project, loadProject } = useBuilderStore();
  const { t, locale } = useLocalization();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const { features, isLoaded: featuresLoaded } = useFeatures();
  const { data: projectData, isSuccess } = useProject(project?.id!);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasLoadedProject, setHasLoadedProject] = useState(false);

  useEffect(() => {
    // Show the onboarding guide if the user profile is loaded and the flag is false
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  // Effect to load project data into the store once it's fetched
  useEffect(() => {
    if (isSuccess && projectData && !hasLoadedProject) {
      loadProject(projectData);
      setHasLoadedProject(true); // Mark as loaded to prevent re-loading
    }
  }, [isSuccess, projectData, loadProject, hasLoadedProject]);


  const onboardingMutation = useMutation({
    mutationFn: async () => {
      if (!firebaseUser) throw new Error("User not authenticated");
      const token = await firebaseUser.getIdToken();
      return markOnboardingComplete(firebaseUser.uid, token);
    },
    onSuccess: () => {
      // Invalidate user query to refetch the updated profile
      queryClient.invalidateQueries({ queryKey: ['user', firebaseUser?.uid] });
      refetchUser();
    },
    onError: (error: Error) => {
      console.error("Failed to mark onboarding as complete:", error);
    }
  });


  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      onboardingMutation.mutate();
    }
  };

  const isFeatureEnabled = (featureId: string) => {
    if (!featuresLoaded) return false;
    const feature = features.find(f => f.id === featureId);
    return feature?.isEnabled;
  };

  const enabledTabs = [
    { id: 'files', enabled: true }, // Files tab is always enabled
    { id: 'report', enabled: isFeatureEnabled('report') },
  ].filter(tab => tab.enabled).map(tab => tab.id);


  // If the current active tab is no longer enabled, switch to the first available one
  useEffect(() => {
    if (!enabledTabs.includes(activeTab) && enabledTabs.length > 0) {
      setActiveTab(enabledTabs[0]);
    } else if (enabledTabs.length === 0) {
      setActiveTab(''); // No tabs are active
    }
  }, [features, activeTab, enabledTabs]);

  return (
    <div className="relative flex-grow flex flex-col">
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      <div className="flex-grow flex flex-col mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
          <div className="flex-1 space-y-1 overflow-auto">
            <h1 className="text-xl font-semibold text-foreground truncate" title={project?.name}>
              {project?.name || t('projects.untitled')}
            </h1>
            <p className="text-sm text-muted-foreground truncate" title={project?.projectIdea}>
              {project?.projectIdea || t('projects.noDescription')}
            </p>
            {projectData?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                {t('projects.updated', { time: formatDistanceToNow(new Date(projectData.updatedAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS }) })}
              </p>
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
                  <FolderKanban className="h-4 w-4" /> {t('builder.tabs.files')}
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
