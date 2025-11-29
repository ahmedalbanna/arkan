'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { BookOpenText, BrainCircuit, GitGraph, Search, UploadCloud } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { ReportResults } from './ReportResults';
import { CollapsibleSidePanel } from '../ui/CollapsibleSidePanel';
import { UploadManager } from '../file/UploadManager';
import { GenerationTools } from './ReportGenerationTools';
import { AIResearcherTool } from '../writing-tools/AIResearcherTool';
import { PlantUMLGeneratorTool } from '../writing-tools/PlantUMLGeneratorTool';


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

export default function ReportModeGenerator() {
    const { locale, t } = useLocalization();

    const panels = [
        {
            key: 'files',
            title: 'Contextual',
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
            title: 'AI Researcher',
            icon: <Search className="h-5 w-5" />,
            content: <AIResearcherTool />,
        },
        {
            key: 'diagram',
            title: 'UML Diagrams',
            icon: <GitGraph className="h-5 w-5" />,
            content: <PlantUMLGeneratorTool />,
        },
    ];


    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            <CollapsibleSidePanel
                panels={panels}
                defaultActiveKey="generate"
                className="lg:col-span-4 xl:col-span-4"
            />
            <div className="lg:col-span-8 xl:col-span-8 h-full">
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults />
                </Suspense>
            </div>
        </div>
    );
}
