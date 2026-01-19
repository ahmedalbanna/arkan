
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils/cn';
import { BookOpenText, Settings, SlidersHorizontal, Languages as LanguageIcon, MessageSquare, ZoomOut, ZoomIn } from 'lucide-react';
import React, { Suspense, lazy, useState } from 'react';
import { Button } from '../ui/button';
import { CollapsibleSidePanel } from '../ui/CollapsibleSidePanel';
import { BuilderPageSkeleton } from '@/app/builder/loading';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { SessionActions } from '@/components/report-mode/session/SessionActions';
import { useReportGenerator } from '@/hooks/report-mode/useReportGenerator';
import { useBeforeUnload } from '@/hooks/util/useBeforeUnload';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ToneSchema } from '@/lib/models';
import type { Language, Tone } from '@/lib/models';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ProjectChat } from './chat/ProjectChat';

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

export default function ReportModeGenerator() {
    const {
        locale,
        isMobile,
        activeMobileView,
        setActiveMobileView,
        activePanelKey,
        setActivePanelKey,
        showOnboarding,
        setShowOnboarding,
        handleOnboardingComplete,
        project,
        isStoreInitialized,
        updateProjectName,
        updateProject,
        panels,
        isChatOpen,
        setIsChatOpen,
        zoomLevel,
        setZoomLevel,
    } = useReportGenerator();
    
    const [isControlsPanelOpen, setIsControlsPanelOpen] = useState(false);
    const [isLanguagePanelOpen, setIsLanguagePanelOpen] = useState(false);
    
    useBeforeUnload();

    const handleComplexityChange = (value: number) => {
        if (project) {
          updateProject(p => p.with({ complexity: value }));
        }
    };
    
    const handleFormalityChange = (value: number) => {
        if (project) {
          updateProject(p => p.with({ formality: value }));
        }
    };

    const handleLanguageChange = (value: Language) => {
        if (project) {
          updateProject(p => p.with({ language: value }));
        }
    };
    
    const handleToneChange = (value: string) => {
        if (project) {
          updateProject(p => p.with({ tone: value as Tone }));
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(2, prev + 0.1));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.1));
    const handleZoomReset = () => setZoomLevel(1);

    if (!isStoreInitialized || !project) {
        return <BuilderPageSkeleton />;
    }

    return (
        <div className="relative flex-grow flex flex-col">
            <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
            
            {/* Global Controls Floating UI - LEFT */}
            <div className="fixed bottom-6 left-6 z-20 hidden lg:flex items-end gap-4">
                <div className="relative">
                    {isControlsPanelOpen && (
                        <div className="absolute bottom-full mb-2 w-64 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg animate-in fade-in-0 slide-in-from-bottom-4">
                            <div className="space-y-6">
                                {/* Formality Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-semibold tracking-wider uppercase">Formality</Label>
                                        <Badge variant="secondary">{project.formality ?? 70}%</Badge>
                                    </div>
                                    <Slider
                                        value={[project.formality ?? 70]}
                                        onValueChange={(val) => handleFormalityChange(val[0])}
                                        min={0}
                                        max={100}
                                        step={10}
                                    />
                                </div>
                                {/* Complexity Slider */}
                                <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                        <Label className="text-xs font-semibold tracking-wider uppercase">Complexity</Label>
                                        <Badge variant="secondary">{project.complexity ?? 50}%</Badge>
                                    </div>
                                    <Slider
                                        value={[project.complexity ?? 50]}
                                        onValueChange={(val) => handleComplexityChange(val[0])}
                                        min={0}
                                        max={100}
                                        step={10}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className="rounded-full h-14 w-14 shadow-lg"
                                    onClick={() => setIsControlsPanelOpen(prev => !prev)}
                                    aria-label="Toggle global controls"
                                >
                                    <SlidersHorizontal className="h-6 w-6" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>Complexity & Formality</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="relative">
                    {isLanguagePanelOpen && (
                         <div className="absolute bottom-full mb-2 w-64 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg animate-in fade-in-0 slide-in-from-bottom-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold tracking-wider uppercase">Language</Label>
                                    <Select value={project.language ?? 'default'} onValueChange={handleLanguageChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="ar">Arabic</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold tracking-wider uppercase">Tone</Label>
                                    <Select value={project.tone ?? 'professional'} onValueChange={handleToneChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ToneSchema.options.map(tone => (
                                                <SelectItem key={tone} value={tone}>
                                                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className="rounded-full h-14 w-14 shadow-lg"
                                    onClick={() => setIsLanguagePanelOpen(prev => !prev)}
                                    aria-label="Toggle language and tone controls"
                                >
                                    <LanguageIcon className="h-6 w-6" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>Language & Tone</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            
            {/* Chat FAB - RIGHT */}
            <div className="fixed bottom-6 right-6 z-20 hidden lg:block">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                className="rounded-full h-16 w-16 shadow-lg"
                                aria-label="Consult with AI Agents"
                                onClick={() => setIsChatOpen(prev => !prev)}
                            >
                                <MessageSquare className="h-8 w-8" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Consult with AI Agents</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Zoom Controls - CENTER */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 hidden lg:flex items-center gap-1 border bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-lg">
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

            <ProjectChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
                        <SessionActions />
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
                                        activeKey={activePanelKey}
                                        onActiveKeyChange={setActivePanelKey}
                                    />
                                </div>
                                <div className={cn(
                                    "lg:col-span-8 xl:col-span-8 h-full",
                                    isMobile && activeMobileView !== 'result' && "hidden"
                                )}>
                                    <ReportResults activePanelKey={activePanelKey} />
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
