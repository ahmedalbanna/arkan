

'use client';

import OnboardingGuide from '@/components/auth/OnboardingGuide';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { MobileCard } from '@/components/ui/mobile-optimized';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useFeatures, useProject } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { BookCheck, Clock, FilePlus2, FileText, FolderKanban, GanttChartSquare, GitGraph, Laptop, Presentation, Sparkles, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

// Enhanced loading skeleton with better UX
const LoadingSkeleton = () => (
  <AnimatedContainer animation="fade-in-up" delay={0}>
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>

      {/* Content Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </Card>
    </div>
  </AnimatedContainer>
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
  () => import('@/components/report-mode/ReportModeGenerator'),
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
  () => import('@/components/report-mode/ReportModeGenerator').then(mod => ({ preload: true }))
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
    <div className="relative flex-grow flex flex-col bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>

      <div className="flex-grow flex flex-col mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full relative z-10">
        {/* Enhanced Header */}
        <AnimatedContainer animation="fade-in-down" delay={0}>
          <MobileCard className="p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1 space-y-3 overflow-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-headline font-bold text-foreground truncate" title={project?.name}>
                      {project?.name || t('projects.untitled')}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Active Project
                      </Badge>
                      {projectData?.updatedAt && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(projectData.updatedAt), { addSuffix: true, locale: locale === 'ar' ? ar : enUS })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2" title={project?.projectIdea}>
                  {project?.projectIdea || t('projects.noDescription')}
                </p>
              </div>
              <div className="flex-none self-start">
                <SessionActions />
              </div>
            </div>

            {/* Project Progress */}
            {projectData && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Project Progress</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <EnhancedProgress
                  value={75}
                  variant="gradient"
                  indicatorVariant="shimmer"
                  size="lg"
                  className="mb-4"
                />
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">8</div>
                    <div className="text-xs text-muted-foreground">Files</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">5</div>
                    <div className="text-xs text-muted-foreground">Sections</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                </div>
              </div>
            )}
          </MobileCard>
        </AnimatedContainer>
        <div className="flex flex-col flex-grow">
          {!featuresLoaded ? (
            <LoadingSkeleton />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
              <AnimatedContainer animation="fade-in-up" delay={200}>
                <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1 sm:gap-2 p-1 sm:p-2 bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger
                    value="files"
                    className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                  >
                    <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('builder.tabs.files')}</span>
                    <span className="sm:hidden">Files</span>
                  </TabsTrigger>
                  {isFeatureEnabled('proposal') && (
                    <TabsTrigger
                      value="proposal"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <FilePlus2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('builder.tabs.proposal')}</span>
                      <span className="sm:hidden">Props</span>
                    </TabsTrigger>
                  )}
                  {isFeatureEnabled('plan') && (
                    <TabsTrigger
                      value="plan"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <GanttChartSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('builder.tabs.plan')}</span>
                      <span className="sm:hidden">Plan</span>
                    </TabsTrigger>
                  )}
                  {isFeatureEnabled('report') && (
                    <TabsTrigger
                      value="report"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('builder.tabs.document')}</span>
                      <span className="sm:hidden">Docs</span>
                    </TabsTrigger>
                  )}
                  {isFeatureEnabled('diagram') && (
                    <TabsTrigger
                      value="diagram"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <GitGraph className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('builder.tabs.diagram')}</span>
                      <span className="sm:hidden">Diag</span>
                    </TabsTrigger>
                  )}
                  {isFeatureEnabled('code') && (
                    <TabsTrigger
                      value="code"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <Laptop className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('builder.tabs.code')}</span>
                      <span className="sm:hidden">Code</span>
                    </TabsTrigger>
                  )}
                  {isFeatureEnabled('presentation') && (
                    <TabsTrigger
                      value="presentation"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <Presentation className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('builder.tabs.presentation')}</span>
                      <span className="sm:hidden">Slides</span>
                    </TabsTrigger>
                  )}
                  {isFeatureEnabled('academic') && (
                    <TabsTrigger
                      value="academic"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                    >
                      <BookCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('header.academicSolver')}</span>
                      <span className="sm:hidden">Study</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </AnimatedContainer>

              <div className="w-full flex-grow mt-4 sm:mt-6 relative">
                {/* Render only the active tab to improve performance */}
                <ErrorBoundary>
                  <div className="h-full">
                    {activeTab === 'files' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <FileManager />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'proposal' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <ProposalModeGenerator />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'plan' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <ProjectPlanGenerator />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'report' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <ReportGenerator />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'diagram' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <DiagramGenerator />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'code' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <CodeGenerator />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'presentation' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <PresentationGenerator />
                      </AnimatedContainer>
                    )}
                    {activeTab === 'academic' && (
                      <AnimatedContainer animation="fade-in-up" delay={0}>
                        <AcademicSolver />
                      </AnimatedContainer>
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
