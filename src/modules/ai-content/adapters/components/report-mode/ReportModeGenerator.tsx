
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
import { type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { BookOpenText, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import { Suspense, lazy } from 'react';


const ReportResults = lazy(() => import('./ReportResults'));



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
        activeChapterId,
        setActiveChapterId,
    } = useReportGenerator(initialProject);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(2, prev + 0.1));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.1));
    const handleZoomReset = () => setZoomLevel(1);

    if (!isStoreInitialized || !project) {
        return <BuilderPageSkeleton />;
    }

    return (
        <div className="relative flex-grow flex flex-col bg-background min-h-screen overflow-hidden">
            <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
            <Suspense fallback={<BuilderPageSkeleton />}>
            {/* Premium Sticky Global Header */}
            <header className="h-16 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between transition-all duration-500">
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-in zoom-in-50 duration-700">
                        <BookOpenText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-lg font-headline font-bold tracking-tight text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent truncate max-w-[200px] lg:max-w-[400px]"
                                value={project?.name || ''}
                                onChange={(e) => updateProjectName(e.target.value)}
                                onBlur={() => updateProject(p => p)}
                                placeholder={'UNTITLED PROJECT'}
                            />
                            <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5 hidden sm:flex">
                                Pro Node
                            </Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-none opacity-40">
                            Arkan Intelligent Document Suite
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <SessionActions isSaving={false} />
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

                <div className="relative z-10 flex-1 flex flex-col p-6 max-w-[1800px] mx-auto w-full h-full">

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
                                    {/* Left Zone - Setup Tools */}
                                    <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
                                        <div className="h-full pr-3">
                                            <CollapsibleSidePanel
                                                panels={leftPanels}
                                                activeKey={activePanelKey}
                                                onActiveKeyChange={setActivePanelKey}
                                                className="h-full border-none shadow-none bg-transparent"
                                            />
                                        </div>
                                    </ResizablePanel>

                                    <ResizableHandle withHandle className="bg-transparent hover:bg-primary/10 transition-colors w-1.5" />

                                    {/* Center Zone - Document Canvas */}
                                    <ResizablePanel defaultSize={56} minSize={40}>
                                        <div className="h-full px-3">
                                            <ReportResults activePanelKey={activePanelKey} />
                                        </div>
                                    </ResizablePanel>

                                    <ResizableHandle withHandle className="bg-transparent hover:bg-primary/10 transition-colors w-1.5" />

                                    {/* Right Zone - AI Context */}
                                    <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
                                        <div className="h-full pl-3">
                                            <CollapsibleSidePanel
                                                panels={rightPanels}
                                                activeKey={activeRightPanelKey}
                                                onActiveKeyChange={setActiveRightPanelKey}
                                                side="right"
                                                className="h-full border-none shadow-none bg-transparent"
                                            />
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            )}
                        </div>

                    {isMobile && <BottomNavBar activeView={activeMobileView} setActiveView={setActiveMobileView} />}
                </div>
                </main>
            </Suspense>
        </div>
    );
}
