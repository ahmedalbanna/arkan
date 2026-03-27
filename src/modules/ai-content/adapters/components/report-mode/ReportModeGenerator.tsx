
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/infrastructure/utils/cn';
import { BookOpenText, ZoomOut, ZoomIn, Settings } from 'lucide-react';
import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { SessionActions } from '@/modules/ai-content/adapters/components/report-mode/session/SessionActions';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';

const ReportResults = lazy(() => import('./ReportResults'));

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
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">Setup</span>
            </Button>
            <Button
                variant={activeView === 'result' ? 'secondary' : 'ghost'}
                className={cn("flex flex-col items-center h-full w-full", activeView === 'result' && "text-primary")}
                onClick={() => setActiveView('result')}
            >
                <BookOpenText className="h-5 w-5 mb-1" />
                <span className="text-xs">Document</span>
            </Button>
        </div>
    );
}

export default function ReportModeGenerator({ initialProject }: { initialProject?: ProjectProperties | null }) {
    const {
        locale,
        isMobile,
        activeMobileView,
        setActiveMobileView,
        activePanelKey,
        setActivePanelKey,
        activeRightPanelKey,
        setActiveRightPanelKey,
        showOnboarding,
        setShowOnboarding,
        handleOnboardingComplete,
        project,
        isStoreInitialized,
        updateProjectName,
        updateProject,
        leftPanels,
        rightPanels,
        zoomLevel,
        setZoomLevel,
    } = useReportGenerator(initialProject);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(2, prev + 0.1));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.1));
    const handleZoomReset = () => setZoomLevel(1);

    if (!isStoreInitialized || !project) {
        return <BuilderPageSkeleton />;
    }

    return (
        <div className="relative flex-grow flex flex-col">
            <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />

            {/* Zoom Controls - CENTER */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden lg:flex items-center gap-1 border border-border/60 bg-background/90 backdrop-blur-sm p-1 rounded-lg shadow-md">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom Out</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={handleZoomReset} className="h-8 text-xs w-16">
                                {(zoomLevel * 100).toFixed(0)}%
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Reset Zoom</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom In</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>


            <div className="flex-grow flex flex-col mx-auto px-4 py-8 w-full">
                <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
                    <div className="flex-1 space-y-2 overflow-auto">
                        <Input
                            className="text-xl font-semibold text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
                            value={project?.name || ''}
                            onChange={(e) => updateProjectName(e.target.value)}
                            onBlur={() => updateProject(p => p)}
                            placeholder={'Untitled Project'}
                        />
                        {project?.meta.updated && (
                            <p className="text-xs text-muted-foreground pt-1">
                                Updated {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
                            </p>
                        )}
                    </div>
                    <div className="flex-none">
                        <SessionActions isSaving={false} />
                    </div>
                </div>
                <div className="flex flex-col flex-grow">
                     <div className="pb-16 lg:pb-0 flex-grow">
                        <Suspense fallback={<ReportSkeleton />}>
                            <div className="h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                {isMobile ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
                                        <div className={cn(
                                            "lg:col-span-4 xl:col-span-4 h-full",
                                            isMobile && activeMobileView !== 'generator' && "hidden"
                                        )}>
                                            <CollapsibleSidePanel
                                                panels={leftPanels}
                                                activeKey={activePanelKey}
                                                onActiveKeyChange={setActivePanelKey}
                                            />
                                        </div>
                                        <div className={cn(
                                            "lg:col-span-8 xl:col-span-8 h-full",
                                            isMobile && activeMobileView !== 'result' && "hidden"
                                        )}>
                                            <div className="flex flex-col gap-6 h-full">
                                                <ReportResults activePanelKey={activePanelKey} />
                                                <CollapsibleSidePanel
                                                    panels={rightPanels}
                                                    activeKey={activeRightPanelKey}
                                                    onActiveKeyChange={setActiveRightPanelKey}
                                                    side="right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                                        {/* Left Zone - Tools */}
                                        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                                            <div className="h-full pr-2">
                                                <CollapsibleSidePanel
                                                    panels={leftPanels}
                                                    activeKey={activePanelKey}
                                                    onActiveKeyChange={setActivePanelKey}
                                                    className="h-full"
                                                />
                                            </div>
                                        </ResizablePanel>
                                        
                                        <ResizableHandle withHandle />
                                        
                                        {/* Center Zone - Preview */}
                                        <ResizablePanel defaultSize={50} minSize={40}>
                                            <div className="h-full px-2">
                                                <ReportResults activePanelKey={activePanelKey} />
                                            </div>
                                        </ResizablePanel>
                                        
                                        <ResizableHandle withHandle />
                                        
                                        {/* Right Zone - Context */}
                                        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                                            <div className="h-full pl-2">
                                                <CollapsibleSidePanel
                                                    panels={rightPanels}
                                                    activeKey={activeRightPanelKey}
                                                    onActiveKeyChange={setActiveRightPanelKey}
                                                    side="right"
                                                    className="h-full"
                                                />
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                )}
                            </div>
                        </Suspense>
                        {isMobile && <BottomNavBar activeView={activeMobileView} setActiveView={setActiveMobileView} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
