
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useMobile } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { BookOpenText, Edit, GitGraph, PenSquare, Search, UploadCloud, Settings } from 'lucide-react';
import React, { Suspense, lazy, useState } from 'react';
import { Button } from '../ui/button';
import { CollapsibleSidePanel } from '../ui/CollapsibleSidePanel';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { useBuilderPageLogic } from '@/hooks/core/use-builder-page';
import { useSaveProject } from '@/hooks';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { SessionActions } from '@/components/report-mode/session/SessionActions';


// Dynamic imports with proper default export handling
const ProjectSettingsPanel = lazy(() => import('./settings/ProjectSettingsPanel'));
const FileManager = lazy(() => import('./file-manager'));
const GenerationTools = lazy(() => import('./generation-tools'));
const AIResearcherTool = lazy(() => import('../writing-tools/AIResearcherTool').then(module => ({ default: module.AIResearcherTool })));
const PlantUMLGeneratorTool = lazy(() => import('../writing-tools/PlantUMLGeneratorTool').then(module => ({ default: module.PlantUMLGeneratorTool })));
const ReportResults = lazy(() => import('./ReportResults'));

const MemoizedProjectSettingsPanel = React.memo(ProjectSettingsPanel);
const MemoizedFileManager = React.memo(FileManager);
const MemoizedGenerationTools = React.memo(GenerationTools);
const MemoizedAIResearcherTool = React.memo(AIResearcherTool);
const MemoizedPlantUMLGeneratorTool = React.memo(PlantUMLGeneratorTool);


function ReportSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            <div className="lg:col-span-4">
                <BuilderPageSkeleton />
            </div>
            <div className="lg:col-span-8">
                <BuilderPageSkeleton />
            </div>
        </div>
    );
}

function BottomNavBar({ activeView, setActiveView }: { activeView: 'generator' | 'result', setActiveView: (view: 'generator' | 'result') => void }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t p-2 flex items-center justify-around z-50 lg:hidden">
            <Button
                variant={activeView === 'generator' ? 'secondary' : 'ghost'}
                className={cn("flex flex-col items-center h-full w-full", activeView === 'generator' && "text-primary")}
                onClick={() => setActiveView('generator')}
            >
                <PenSquare className="h-5 w-5 mb-1" />
                <span className="text-xs">Generator</span>
            </Button>
            <Button
                variant={activeView === 'result' ? 'secondary' : 'ghost'}
                className={cn("flex flex-col items-center h-full w-full", activeView === 'result' && "text-primary")}
                onClick={() => setActiveView('result')}
            >
                <Edit className="h-5 w-5 mb-1" />
                <span className="text-xs">Editor</span>
            </Button>
        </div>
    );
}

export default function ReportModeGenerator() {
    const { locale, t } = useLocalization();
    const isMobile = useMobile();
    const [activeMobileView, setActiveMobileView] = useState<'generator' | 'result'>('result');

    const {
        showOnboarding,
        setShowOnboarding,
        handleOnboardingComplete,
        project,
        isStoreInitialized,
        updateProjectName,
    } = useBuilderPageLogic();
    
    const { isSaving } = useSaveProject();

    const panels = [
        {
            key: 'settings',
            title: 'Project Settings',
            icon: <Settings className="h-5 w-5" />,
            content: <MemoizedProjectSettingsPanel />,
        },
        {
            key: 'files',
            title: t('builder.tabs.files'),
            icon: <UploadCloud className="h-5 w-5" />,
            content: <MemoizedFileManager />,
        },
        {
            key: 'generate',
            title: t('builder.reportGenerator.toolsTitle'),
            icon: <BookOpenText className="h-5 w-5" />,
            content: <MemoizedGenerationTools />,
        },
        {
            key: 'research',
            title: t('writingTools.aiResearcher.pageTitle'),
            icon: <Search className="h-5 w-5" />,
            content: <MemoizedAIResearcherTool />,
        },
        {
            key: 'diagram',
            title: t('builder.tabs.diagram'),
            icon: <GitGraph className="h-5 w-5" />,
            content: <MemoizedPlantUMLGeneratorTool />,
        },
    ];

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
                     <div className="pb-16 lg:pb-0 flex-grow">
                        <Suspense fallback={<ReportSkeleton />}>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                <div className={cn(
                                    "lg:col-span-4 xl:col-span-4 h-full",
                                    isMobile && activeMobileView !== 'generator' && "hidden"
                                )}>
                                    <CollapsibleSidePanel
                                        panels={panels}
                                        defaultActiveKey="settings"
                                    />
                                </div>
                                <div className={cn(
                                    "lg:col-span-8 xl:col-span-8 h-full",
                                    isMobile && activeMobileView !== 'result' && "hidden"
                                )}>
                                    <ReportResults />
                                </div>
                            </div>
                        </Suspense>
                        {isMobile && <BottomNavBar activeView={activeMobileView} setActiveView={setActiveMobileView} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
