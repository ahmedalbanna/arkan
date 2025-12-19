
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { BookOpenText, UploadCloud, PenSquare, Edit, FileInput } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { ReportResults } from './ReportResults';
import { UploadManager } from '../file/UploadManager';
import { GenerationTools } from './ReportGenerationTools';
import { useMobile } from '@/hooks';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


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

function LeftPanel() {
    const { t } = useLocalization();
    return (
        <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-1">
                 <Tabs defaultValue="files" className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="files" className="flex items-center gap-2">
                            <UploadCloud className="h-4 w-4" />
                            {t('builder.tabs.files')}
                        </TabsTrigger>
                        <TabsTrigger value="generate" className="flex items-center gap-2">
                            <BookOpenText className="h-4 w-4" />
                            {t('builder.reportGenerator.toolsTitle')}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="files" className="flex-1 mt-4 overflow-y-auto">
                        <UploadManager />
                    </TabsContent>
                    <TabsContent value="generate" className="flex-1 mt-4 overflow-y-auto">
                        <GenerationTools />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}


export default function ReportModeGenerator() {
    const { locale } = useLocalization();
    const isMobile = useMobile();
    const [activeMobileView, setActiveMobileView] = useState<'generator' | 'result'>('result');

    return (
        <div className="pb-16 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {isMobile ? (
                    <>
                        {activeMobileView === 'generator' && <div className="lg:col-span-4 xl:col-span-4"><LeftPanel /></div>}
                        {activeMobileView === 'result' && <div className="lg:col-span-8 xl:col-span-8 h-full">
                            <Suspense fallback={<ReportSkeleton />}>
                                <ReportResults />
                            </Suspense>
                        </div>}
                    </>
                ) : (
                    <>
                        <div className="lg:col-span-4 xl:col-span-4 h-full">
                           <LeftPanel />
                        </div>
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
