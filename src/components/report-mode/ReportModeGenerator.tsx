
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { BookOpenText, GitGraph, Search, UploadCloud, PenSquare, Edit, FileInput } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { ReportResults } from './ReportResults';
import { CollapsibleSidePanel } from '../ui/CollapsibleSidePanel';
import { UploadManager } from '../file/UploadManager';
import { GenerationTools } from './ReportGenerationTools';
import { AIResearcherTool } from '../writing-tools/AIResearcherTool';
import { PlantUMLGeneratorTool } from '../writing-tools/PlantUMLGeneratorTool';
import { useMobile } from '@/hooks';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';


function ReportSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            <div className="lg:col-span-4">
                <Skeleton className="h-[calc(100vh-200px)]" />
            </div>
            <div className="lg:col-span-8">
                <Skeleton className="h-[calc(100vh-200px)]" />
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


    const panels = [
        {
            key: 'files',
            title: t('builder.tabs.files'),
            icon: <UploadCloud className="h-5 w-5" />,
            content: <UploadManager />,
        },
        {
            key: 'generate',
            title: t('builder.reportGenerator.toolsTitle'),
            icon: <BookOpenText className="h-5 w-5" />,
            content: <GenerationTools />,
        },
        {
            key: 'research',
            title: t('writingTools.aiResearcher.pageTitle'),
            icon: <Search className="h-5 w-5" />,
            content: <AIResearcherTool />,
        },
        {
            key: 'diagram',
            title: t('builder.tabs.diagram'),
            icon: <GitGraph className="h-5 w-5" />,
            content: <PlantUMLGeneratorTool />,
        },
    ];


    return (


        <div className="pb-16 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {isMobile ? (
                    <>
                        {activeMobileView === 'generator' && <CollapsibleSidePanel
                            panels={panels}
                            defaultActiveKey="files"
                            className="lg:col-span-4 xl:col-span-4"
                        />}
                        {activeMobileView === 'result' && <div className="lg:col-span-8 xl:col-span-8 h-full">
                            <Suspense fallback={<ReportSkeleton />}>
                                <ReportResults />
                            </Suspense>
                        </div>}
                    </>
                ) : (
                    <>
                        <CollapsibleSidePanel
                            panels={panels}
                            defaultActiveKey="files"
                            className="lg:col-span-4 xl:col-span-4"
                        />
                        <div className="lg:col-span-8 xl:col-span-8 h-full">
                            <Suspense fallback={<ReportSkeleton />}>
                                <ReportResults />
                            </Suspense>
                        </div>
                    </>
                )}
            </div>

            {isMobile && <BottomNavBar activeView={activeMobileView} setActiveView={setActiveMobileView} />}
        </div>
    );
}
