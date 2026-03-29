
'use client';

import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { SessionActions } from '@/modules/ai-content/adapters/components/report-mode/session/SessionActions';
import { useReportGenerator } from '@/modules/ai-content/adapters/hooks/report-mode/useReportGenerator';
import { useKeyboardShortcuts } from '@/modules/ai-content/adapters/hooks/report-mode/useKeyboardShortcuts';
import { useSaveProject } from '@/modules/projects/adapters/hooks/use-projects';
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { BookOpenText, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import { Suspense, lazy } from 'react';


const ReportResults = lazy(() => import('./ReportResults'));



export default function ReportModeGenerator({ initialProject }: { initialProject?: ProjectProperties | null }) {
    const {
        locale,
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
        activeChapterId,
        setActiveChapterId,
        selectedSectionIds,
        handleActiveSectionChange,
        isOutlineVisible,
        setIsOutlineVisible,
    } = useReportGenerator(initialProject);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(2, prev + 0.1));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.1));
    const handleZoomReset = () => setZoomLevel(1);

    const { saveProjectMutation } = useSaveProject();

    useKeyboardShortcuts({
        onSave: () => {
            if (project) {
                saveProjectMutation.mutate(project.toStateObject());
            }
        },
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
        onZoomReset: handleZoomReset,
    });

    if (!isStoreInitialized || !project) {
        return <BuilderPageSkeleton />;
    }

    return (
        <div className="relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden">
            <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
            <Suspense fallback={<BuilderPageSkeleton />}>
            {/* High-Fidelity Command Bridge */}
            <header className="h-16 border-b border-border/40 bg-background/40 backdrop-blur-2xl shrink-0 z-50 px-8 flex items-center justify-between transition-all duration-700 ease-in-out group/header">
                {/* Animated Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative group/logo">
                        <div className="absolute -inset-1.5 bg-primary/20 rounded-xl blur opacity-0 group-hover/logo:opacity-100 transition duration-500" />
                        <div className="relative h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 animate-in zoom-in-50 duration-700 border border-primary/20">
                            <BookOpenText className="h-5 w-5 text-primary-foreground" />
                        </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="relative group/input">
                                <Input
                                    className="text-lg font-black tracking-tighter text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent truncate max-w-[200px] lg:max-w-[400px] transition-all duration-300"
                                    value={project?.name || ''}
                                    onChange={(e) => updateProjectName(e.target.value)}
                                    onBlur={() => updateProject(p => p)}
                                    placeholder={'UNTITLED_MANIFEST'}
                                />
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-primary/40 group-focus-within/input:w-full transition-all duration-500" />
                            </div>
                            <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5 ring-1 ring-primary/10">
                                Pro Node_v1.0
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 opacity-40 group-hover/header:opacity-100 transition-opacity duration-500">
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">
                                Intelligence Workspace Synthesis
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <SessionActions isSaving={saveProjectMutation.isPending} />
                </div>
            </header>

            {/* Premium Zoom HUD - CENTER */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-1 border bg-background/60 backdrop-blur-xl p-1 rounded-2xl shadow-2xl shadow-primary/10 border-white/10 ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomOut}
                                className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-90"
                            >
                                <ZoomOut className="h-4.5 w-4.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] font-bold uppercase tracking-widest">Zoom Out</TooltipContent>
                    </Tooltip>

                    <div className="h-4 w-px bg-border/40 mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomReset}
                                className="h-9 min-w-[64px] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all duration-300"
                            >
                                {(zoomLevel * 100).toFixed(0)}%
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] font-bold uppercase tracking-widest">Reset View</TooltipContent>
                    </Tooltip>

                    <div className="h-4 w-px bg-border/40 mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomIn}
                                className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-90"
                            >
                                <ZoomIn className="h-4.5 w-4.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] font-bold uppercase tracking-widest">Zoom In</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Immersive Global Environment Layer */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.05), transparent 50%)' }} />
                </div>

                <div className="relative z-10 flex-1 flex flex-col p-6 mx-auto w-full h-full">

                        <div className="h-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                            <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                                {/* Left Zone - Setup Tools */}
                                <ResizablePanel
                                    defaultSize={activePanelKey ? 22 : 6}
                                    minSize={activePanelKey ? 18 : 6}
                                    maxSize={activePanelKey ? 35 : 6}
                                    className="transition-all duration-500 ease-in-out"
                                >
                                    <div className="h-full pr-3 flex flex-col min-h-0">
                                        <CollapsibleSidePanel
                                            panels={leftPanels}
                                            activeKey={activePanelKey}
                                            onActiveKeyChange={setActivePanelKey}
                                            className="flex-1 min-h-0"
                                        />
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle className="bg-transparent hover:bg-primary/10 transition-colors w-1.5" />

                                {/* Center Zone - Document Canvas */}
                                <ResizablePanel defaultSize={56} minSize={40}>
                                    <div className="h-full px-3 flex flex-col min-h-0">
                                        <ReportResults 
                                            activePanelKey={activePanelKey} 
                                            activeChapterId={activeChapterId}
                                            setActiveChapterId={setActiveChapterId}
                                            selectedSectionIds={selectedSectionIds}
                                            handleActiveSectionChange={handleActiveSectionChange}
                                            isOutlineVisible={isOutlineVisible}
                                            setIsOutlineVisible={setIsOutlineVisible}
                                        />
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle className="bg-transparent hover:bg-primary/10 transition-colors w-1.5" />

                                {/* Right Zone - AI Context */}
                                <ResizablePanel
                                    defaultSize={activeRightPanelKey ? 22 : 6}
                                    minSize={activeRightPanelKey ? 18 : 6}
                                    maxSize={activeRightPanelKey ? 35 : 6}
                                    className="transition-all duration-500 ease-in-out"
                                >
                                    <div className="h-full pl-3 flex flex-col min-h-0">
                                        <CollapsibleSidePanel
                                            panels={rightPanels}
                                            activeKey={activeRightPanelKey}
                                            onActiveKeyChange={setActiveRightPanelKey}
                                            side="right"
                                            className="flex-1 min-h-0"
                                        />
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>
                </div>
                </main>
            </Suspense>
        </div>
    );
}
