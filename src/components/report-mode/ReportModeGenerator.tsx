
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { useReportModeGenerator } from '@/hooks';
import { Section } from '@/lib/models/section';
import { cn } from '@/lib/utils';
import { PanelRightOpen } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './GenerationTools';
import { ReportResults } from './ReportResults';

function ReportSkeleton() {
    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                <div className="lg:col-span-4">
                    <div className="relative min-h-[calc(100vh-200px)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/5"></div>
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
                        <Skeleton className="h-[calc(100vh-200px)] backdrop-blur-md" />
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <div className="relative min-h-[calc(100vh-200px)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/5"></div>
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
                        <Skeleton className="h-[calc(100vh-200px)] backdrop-blur-md" />
                    </div>
                </div>
            </div>
        </AnimatedContainer>
    );
}

export default function ReportModeGenerator() {

    const {
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        generatedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agents,
        agentsLoaded,
        orderedSections,
        setOrderedSections
    } = useReportModeGenerator();

    if (!agentsLoaded) {
        return <ReportSkeleton />;
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>

            {/* Main Content */}
            <AnimatedContainer animation="fade-in-down" delay={200}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start relative z-10" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    {isPanelCollapsed && (
                        <AnimatedContainer animation="fade-in-left" delay={300}>
                            <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                                <Button
                                    variant="gradient"
                                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180 hover:shadow-glow transition-all duration-200"
                                    onClick={() => setIsPanelCollapsed(false)}
                                >
                                    <PanelRightOpen className="h-5 w-5 mb-2" />
                                    Generation Tools
                                </Button>
                            </div>
                        </AnimatedContainer>
                    )}

                    <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <GenerationTools
                                onCollapseToggle={() => setIsPanelCollapsed(true)}
                                orderedSections={orderedSections}
                                setOrderedSections={setOrderedSections}
                                isAnythingGenerating={isAnythingGenerating}
                                activeMutationKey={activeMutationKey}
                                onGenerateSection={onGenerateSection}
                                hasCreditsForSingleSection={hasCreditsForSingleSection}
                                agents={agents}
                            />
                        </AnimatedContainer>
                    </div>



                    <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                        <AnimatedContainer animation="fade-in-up" delay={500}>
                            <Suspense fallback={<ReportSkeleton />}>
                                <ReportResults
                                    key={activeMutationKey}
                                    generatedSections={generatedSections.map((s: Section) => s.id as any)}
                                />
                            </Suspense>
                        </AnimatedContainer>
                    </div>

                </div>
            </AnimatedContainer>
        </div>
    );
}
