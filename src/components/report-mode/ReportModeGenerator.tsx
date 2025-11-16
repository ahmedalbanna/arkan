
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils/cn';
import { PanelRightOpen } from 'lucide-react';
import { Suspense, useState } from 'react';
import { UploadManager } from '../file/UploadManager';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { AIResearcherTool } from '../writing-tools/AIResearcherTool';
import { PlantUMLGeneratorTool } from '../writing-tools/PlantUMLGeneratorTool';
import { GenerationTools } from './ReportGenerationTools';
import { ReportResults } from './ReportResults';

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
    const { locale } = useLocalization();
    const [isFileManagerCollapsed, setIsFileManagerCollapsed] = useState(false);
    const [isGenerateCollapsed, setIsGenerateCollapsed] = useState(false);
    const [isResearchCollapsed, setIsResearchCollapsed] = useState(false);
    const [isUMLDiagramCollapsed, setIsUMLDiagramCollapsed] = useState(false);


    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            <div className="col-span-12 md:col-span-5 xl:col-span-4 col-mb-2 md:overflow-y-auto md:pr-2 transition-all duration-300 inline-flex gap-2 flex-nowrap flex-row">
                <div className=" md:block md:col-span-1 md:sticky">
                    
                    <div className="col">
                        <Button
                            variant="secondary"
                            className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                            onClick={() => { if (isFileManagerCollapsed) return setIsFileManagerCollapsed(false); else return setIsFileManagerCollapsed(true); }}
                        >
                            <PanelRightOpen className="h-5 w-5 mb-2" />
                            Upload Manager
                        </Button>
                    </div>

                    <div className="col">
                        <Button
                            variant="secondary"
                            className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                            onClick={() => { if (isGenerateCollapsed) return setIsGenerateCollapsed(false); else return setIsGenerateCollapsed(true); }}
                        >
                            <PanelRightOpen className="h-5 w-5 mb-2" />
                            Table Of Content
                        </Button>
                    </div>

                    <div className="col">
                        <Button
                            variant="secondary"
                            className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                            onClick={() => { if (isResearchCollapsed) return setIsResearchCollapsed(false); else return setIsResearchCollapsed(true); }}
                        >
                            <PanelRightOpen className="h-5 w-5 mb-2" />
                            Research Tool
                        </Button>
                    </div>
                    <div className="col">
                        <Button
                            variant="secondary"
                            className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                            onClick={() => { if (isUMLDiagramCollapsed) return setIsUMLDiagramCollapsed(false); else return setIsUMLDiagramCollapsed(true); }}
                        >
                            <PanelRightOpen className="h-5 w-5 mb-2" />
                            UML Diagram
                        </Button>
                    </div>



                </div>

                <div className="col-span-12 md:col-span-5 xl:col-span-4 space-y-6 md:overflow-y-auto md:pr-2 transition-all duration-300">
                    <div className={cn("col", isFileManagerCollapsed && "hidden")}>
                        <UploadManager />
                    </div>
                    <div className={cn("col", isGenerateCollapsed && "hidden")}>
                        <GenerationTools
                        />
                    </div>
                    <div className={cn("col", isResearchCollapsed && "hidden")}>
                        <AIResearcherTool />
                    </div>

                    <div className={cn("col", isUMLDiagramCollapsed && "hidden")}>
                        <PlantUMLGeneratorTool />
                    </div>
                </div>

            </div>
            <div className={cn("col-span-12 md:overflow-y-auto pr-2", isGenerateCollapsed && isResearchCollapsed && isFileManagerCollapsed ? "md:col-span-11 xl:col-span-11" : "md:col-span-7 xl:col-span-8")}>
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults />
                </Suspense>
            </div>
        </div>
    );
}
