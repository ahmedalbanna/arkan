

'use client';

import { useState, useEffect } from 'react';
import { FileText, Laptop, Presentation, FilePlus2, GitGraph, GanttChartSquare, BookCheck, MessageSquare, FolderKanban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuilderStore } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import OnboardingGuide from '@/components/auth/OnboardingGuide';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFeatures } from '@/hooks';
import type { Feature } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProject } from '@/hooks';
import ProjectChat from '@/components/chat/ProjectChat';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';


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


const ProposalModeGenerator = dynamic(() => import('@/components/proposal-mode/ProposalModeGenerator').then(mod => mod.ProposalModeGenerator), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const ReportGenerator = dynamic(() => import('@/components/report-mode/ReportModeGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const DiagramGenerator = dynamic(() => import('@/components/diagram-mode/DiagramGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const CodeGenerator = dynamic(() => import('@/components/code-mode/CodeGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const PresentationGenerator = dynamic(() => import('@/components/presentation-mode/PresentationGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const ProjectPlanGenerator = dynamic(() => import('@/components/plan-mode/ProjectPlanGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const AcademicSolver = dynamic(() => import('@/components/academicSolver-mode/AcademicSolver'), {
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
  const [activeTab, setActiveTab] = useState("proposal");
  const { project, loadProject } = useBuilderStore();
  const proposal = project?.proposal;
  const currentProjectId = project?.id;
  const projectName = project?.name;
  const projectIdea = project?.projectIdea;
  const { t, locale } = useLocalization();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const { features, isLoaded: featuresLoaded } = useFeatures();
  const { data: projectData, isSuccess } = useProject(currentProjectId!);

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
          loadState(projectData);
          setHasLoadedProject(true); // Mark as loaded to prevent re-loading
      }
  }, [isSuccess, projectData, loadState, hasLoadedProject]);


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
      { id: 'proposal', enabled: isFeatureEnabled('proposal') },
      { id: 'plan', enabled: isFeatureEnabled('plan') },
      { id: 'report', enabled: isFeatureEnabled('report') },
      { id: 'diagram', enabled: isFeatureEnabled('diagram') },
      { id: 'code', enabled: isFeatureEnabled('code') },
      { id: 'presentation', enabled: isFeatureEnabled('presentation') },
      { id: 'academic', enabled: isFeatureEnabled('academic') },
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
             <h1 className="text-xl font-semibold text-foreground truncate" title={projectName}>
              {projectName || t('projects.untitled')}
            </h1>
            <p className="text-sm text-muted-foreground truncate" title={projectIdea}>
              {projectIdea || t('projects.noDescription')}
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
                    <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
                        <TabsTrigger value="files" className="gap-2">
                            <FolderKanban className="h-4 w-4" /> {t('builder.tabs.files')}
                        </TabsTrigger>
                        {isFeatureEnabled('proposal') && (
                            <TabsTrigger value="proposal" className="gap-2">
                                <FilePlus2 className="h-4 w-4" /> {t('builder.tabs.proposal')}
                            </TabsTrigger>
                        )}
                        {isFeatureEnabled('plan') && (
                            <TabsTrigger value="plan" className="gap-2">
                                <GanttChartSquare className="h-4 w-4" /> {t('builder.tabs.plan')}
                            </TabsTrigger>
                        )}
                        {isFeatureEnabled('report') && (
                            <TabsTrigger value="report" className="gap-2">
                                <FileText className="h-4 w-4" /> {t('builder.tabs.document')}
                            </TabsTrigger>
                        )}
                        {isFeatureEnabled('diagram') && (
                            <TabsTrigger value="diagram" className="gap-2">
                                <GitGraph className="h-4 w-4" /> {t('builder.tabs.diagram')}
                            </TabsTrigger>
                        )}
                        {isFeatureEnabled('code') && (
                            <TabsTrigger value="code" className="gap-2">
                                <Laptop className="h-4 w-4" /> {t('builder.tabs.code')}
                            </TabsTrigger>
                        )}
                        {isFeatureEnabled('presentation') && (
                             <TabsTrigger value="presentation" className="gap-2">
                                <Presentation className="h-4 w-4" /> {t('builder.tabs.presentation')}
                            </TabsTrigger>
                        )}
                        {isFeatureEnabled('academic') && (
                             <TabsTrigger value="academic" className="gap-2">
                                <BookCheck className="h-4 w-4" /> {t('header.academicSolver')}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <div className="w-full flex-grow mt-4">
                        <TabsContent value="files" className="h-full animate-fade-in">
                            {activeTab === 'files' && <FileManager />}
                        </TabsContent>
                        <TabsContent value="proposal" className="h-full animate-fade-in">
                            {activeTab === 'proposal' && <ProposalModeGenerator />}
                        </TabsContent>
                         <TabsContent value="plan" className="h-full animate-fade-in">
                            {activeTab === 'plan' && <ProjectPlanGenerator />}
                        </TabsContent>
                        <TabsContent value="report" className="h-full animate-fade-in">
                            {activeTab === 'report' && <ReportGenerator />}
                        </TabsContent>
                        <TabsContent value="diagram" className="h-full animate-fade-in">
                            {activeTab === 'diagram' && <DiagramGenerator />}
                        </TabsContent>
                        <TabsContent value="code" className="h-full animate-fade-in">
                            {activeTab === 'code' && <CodeGenerator />}
                        </TabsContent>
                        <TabsContent value="presentation" className="h-full animate-fade-in">
                            {activeTab === 'presentation' && <PresentationGenerator />}
                        </TabsContent>
                         <TabsContent value="academic" className="h-full animate-fade-in">
                            {activeTab === 'academic' && <AcademicSolver />}
                        </TabsContent>
                    </div>
                 </Tabs>
            )}
        </div>
      </div>
      <ProjectChat />
    </div>
  );
}

export default function GeneratePage() {
    return (
        <GeneratePageContent />
    )
}


