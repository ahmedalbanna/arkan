

'use client';

import OnboardingGuide from '@/components/auth/OnboardingGuide';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useFeatures, useProject } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { BookCheck, FilePlus2, FileText, FolderKanban, GanttChartSquare, GitGraph, Laptop, Presentation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

// Enhanced loading skeleton with better UX
const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center space-x-2 mb-4">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-[calc(100vh-300px)] w-full rounded-lg" />
  </div>
);

// Optimized dynamic imports with preloading capabilities
const createOptimizedDynamicComponent = (
  importFn: () => Promise<any>,
  options: {
    fallback?: React.ComponentType;
    preload?: boolean;
  } = {}
) => {
  const { fallback = LoadingSkeleton, preload = false } = options;

  if (preload) {
    // Preload the component on idle
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    }
  }

  return dynamic(importFn, {
    ssr: true,
    loading: () => {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    },
  });
};

// Dynamic component imports with optimizations
const SessionActions = createOptimizedDynamicComponent(
  () => import('@/components/project/SessionActions').then(mod => ({ default: mod.SessionActions })),
  { preload: true }
);

const ProposalModeGenerator = createOptimizedDynamicComponent(
  () => import('@/components/proposal-mode/ProposalModeGenerator').then(mod => ({ default: mod.ProposalModeGenerator })),
  { preload: true }
);

const ReportGenerator = createOptimizedDynamicComponent(
  () => import('@/components/intelligent-report/IntelligentReportModeGenerator'),
  { preload: true }
);

const DiagramGenerator = createOptimizedDynamicComponent(
  () => import('@/components/diagram-mode/DiagramGenerator'),
  { preload: true }
);

const CodeGenerator = createOptimizedDynamicComponent(
  () => import('@/components/code-mode/CodeGenerator'),
  { preload: true }
);

const PresentationGenerator = createOptimizedDynamicComponent(
  () => import('@/components/presentation-mode/PresentationGenerator')
);

const ProjectPlanGenerator = createOptimizedDynamicComponent(
  () => import('@/components/plan-mode/ProjectPlanGenerator'),
  { preload: true }
);

const AcademicSolver = createOptimizedDynamicComponent(
  () => import('@/components/academicSolver-mode/AcademicSolver')
);

const FileManager = createOptimizedDynamicComponent(
  () => import('@/components/file/FileManager'),
  { preload: true }
);

const IntelligentReportGenerator = createOptimizedDynamicComponent(
  () => import('@/components/intelligent-report/EnhancedIntelligentReportGenerator').then(mod => ({ default: mod.EnhancedIntelligentReportGenerator }))
);


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
  const { t, locale } = useLocalization();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const { features, isLoaded: featuresLoaded } = useFeatures();
  const { data: projectData, isSuccess } = useProject(project?.id!);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasLoadedProject, setHasLoadedProject] = useState(false);

  // Memoize feature checking function to prevent recalculation
  const isFeatureEnabled = useMemo(() => {
    return (featureId: string) => {
      if (!featuresLoaded) return false;
      const feature = features.find(f => f.id === featureId);
      return feature?.isEnabled;
    };
  }, [features, featuresLoaded]);

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


  // Memoize enabled tabs to prevent unnecessary recalculations
  const enabledTabs = useMemo(() => {
    const tabs = [
      { id: 'files', enabled: true }, // Files tab is always enabled
      { id: 'proposal', enabled: isFeatureEnabled('proposal') },
      { id: 'plan', enabled: isFeatureEnabled('plan') },
      { id: 'report', enabled: isFeatureEnabled('report') },
      { id: 'diagram', enabled: isFeatureEnabled('diagram') },
      { id: 'code', enabled: isFeatureEnabled('code') },
      { id: 'presentation', enabled: isFeatureEnabled('presentation') },
      { id: 'academic', enabled: isFeatureEnabled('academic') },
    ].filter(tab => tab.enabled).map(tab => tab.id);

    return tabs;
  }, [features, featuresLoaded]); // Only recalculate when features change


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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4 max-w-full">
          <div className="flex-1 space-y-1 overflow-auto">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate" title={project?.name}>
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
          <div className="flex-none self-start">
            <SessionActions />
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          {!featuresLoaded ? (
            <LoadingSkeleton />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
              <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1">
                <TabsTrigger value="files" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('builder.tabs.files')}</span>
                  <span className="sm:hidden">Files</span>
                </TabsTrigger>
                {isFeatureEnabled('proposal') && (
                  <TabsTrigger value="proposal" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <FilePlus2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.proposal')}</span>
                    <span className="sm:hidden">Props</span>
                  </TabsTrigger>
                )}
                {isFeatureEnabled('plan') && (
                  <TabsTrigger value="plan" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <GanttChartSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.plan')}</span>
                    <span className="sm:hidden">Plan</span>
                  </TabsTrigger>
                )}
                {isFeatureEnabled('report') && (
                  <TabsTrigger value="report" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.document')}</span>
                    <span className="sm:hidden">Docs</span>
                  </TabsTrigger>
                )}
                {isFeatureEnabled('diagram') && (
                  <TabsTrigger value="diagram" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <GitGraph className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.diagram')}</span>
                    <span className="sm:hidden">Diag</span>
                  </TabsTrigger>
                )}
                {isFeatureEnabled('code') && (
                  <TabsTrigger value="code" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Laptop className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.code')}</span>
                    <span className="sm:hidden">Code</span>
                  </TabsTrigger>
                )}
                {isFeatureEnabled('presentation') && (
                  <TabsTrigger value="presentation" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Presentation className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.presentation')}</span>
                    <span className="sm:hidden">Slides</span>
                  </TabsTrigger>
                )}
                {isFeatureEnabled('academic') && (
                  <TabsTrigger value="academic" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <BookCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('header.academicSolver')}</span>
                    <span className="sm:hidden">Study</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="w-full flex-grow mt-4 relative">
                {/* Render only the active tab to improve performance */}
                <ErrorBoundary>
                  <div className="h-full">
                    {activeTab === 'files' && (
                      <div className="animate-fade-in">
                        <FileManager />
                      </div>
                    )}
                    {activeTab === 'proposal' && (
                      <div className="animate-fade-in">
                        <ProposalModeGenerator />
                      </div>
                    )}
                    {activeTab === 'plan' && (
                      <div className="animate-fade-in">
                        <ProjectPlanGenerator />
                      </div>
                    )}
                    {activeTab === 'report' && (
                      <div className="animate-fade-in">
                        <ReportGenerator />
                      </div>
                    )}
                    {activeTab === 'diagram' && (
                      <div className="animate-fade-in">
                        <DiagramGenerator />
                      </div>
                    )}
                    {activeTab === 'code' && (
                      <div className="animate-fade-in">
                        <CodeGenerator />
                      </div>
                    )}
                    {activeTab === 'presentation' && (
                      <div className="animate-fade-in">
                        <PresentationGenerator />
                      </div>
                    )}
                    {activeTab === 'academic' && (
                      <div className="animate-fade-in">
                        <AcademicSolver />
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
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
