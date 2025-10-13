
'use client';

import { type DiagramType, type SectionName as SectionNameType } from '@/ai/schemas';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useContextSelector, useSectionAccordionItemLogic } from '@/hooks';
import { useSectionGenerationData } from '@/hooks/use-section-generation-data';
import type { Agent } from '@/lib/models/agent';
import { Brain, Eye, FileText, GripVertical, Loader2, Settings, Sliders, Sparkles } from 'lucide-react';
import { OrganizedContextDisplay } from './OrganizedContextDisplay';
import { ContextSelector } from './SectionContextSelector';
import { ContextSummary } from './SectionContextSummary';
import { ContextViewer } from './SectionContextViewer';
import { SectionGenerationControls } from './SectionGenerationControls';
import { SectionGenerationControlsSummary } from './SectionGenerationControlsSummary';
import { GuidelineEditor } from './SectionGuidelineEditor';
import { GuidelinesSummary } from './SectionGuidelinesSummary';

export const SectionAccordionItem = ({
    itemKey,
    agent,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
    handleProps,
}: {
    itemKey: SectionNameType | DiagramType,
    agent: Agent,
    onGenerate: () => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
    handleProps?: any,
}) => {
    const {
        t,
        title,
        disabledReason,
    } = useSectionAccordionItemLogic(agent);

    // استخدام hook تحديد السياق
    const {
        hasContext,
        currentSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
    } = useContextSelector(itemKey);

    // استخدام hook البيانات الجديد للسياق المنظم
    const { organizedContext, contextStatistics } = useSectionGenerationData(itemKey);

    const canGenerate = hasCredits && !isAnythingGenerating;

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <AccordionItem value={itemKey} key={itemKey} className="bg-background border rounded-lg hover:shadow-soft transition-all duration-200">
                <div className="flex items-center">
                    {handleProps && (
                        <div {...handleProps} className="p-2 cursor-grab touch-none hover:bg-muted/50 rounded-md transition-colors">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    <AccordionTrigger className="flex-1 rounded-md px-4 py-2 text-sm font-medium hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                        <div className="flex items-center gap-2">
                            {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            <span className="font-headline">{title}</span>
                            {/* مؤشر السياق المحدد مع إحصائيات السياق المنظم */}
                            {hasContext && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-soft" title="Context selected" />
                                    {contextStatistics && contextStatistics.totalItems > 0 && (
                                        <Badge variant="secondary" className="text-xs shadow-soft">
                                            {contextStatistics.totalItems}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </AccordionTrigger>
                    <div className="p-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={onGenerate}
                                            disabled={!canGenerate}
                                            variant={canGenerate ? "gradient" : "secondary"}
                                            className="font-headline hover:shadow-glow transition-all duration-200"
                                        >
                                            {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                            {t('builder.reportGenerator.generateButton')}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {disabledReason && (
                                    <TooltipContent>
                                        <p>{disabledReason}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <AccordionContent className="p-4 border-t bg-gradient-to-r from-background/50 to-primary/5">
                    <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm">
                            <TabsTrigger value="summary" className="flex items-center gap-2 hover:shadow-soft transition-all duration-200">
                                <Eye className="h-4 w-4" />
                                {t('builder.reportGenerator.contextSummary')}
                            </TabsTrigger>
                            <TabsTrigger value="context" className="flex items-center gap-2 hover:shadow-soft transition-all duration-200">
                                <Settings className="h-4 w-4" />
                                {t('builder.reportGenerator.contextSettings')}
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="flex items-center gap-2 hover:shadow-soft transition-all duration-200">
                                <Eye className="h-4 w-4" />
                                {t('builder.reportGenerator.contextPreview')}
                            </TabsTrigger>
                            <TabsTrigger value="organized" className="flex items-center gap-2 hover:shadow-soft transition-all duration-200">
                                <Brain className="h-4 w-4" />
                                {t('builder.reportGenerator.organizedContext')}
                            </TabsTrigger>
                            <TabsTrigger value="controls" className="flex items-center gap-2 hover:shadow-soft transition-all duration-200">
                                <Sliders className="h-4 w-4" />
                                {t('builder.reportGenerator.generationControls')}
                            </TabsTrigger>
                            <TabsTrigger value="guidelines" className="flex items-center gap-2 hover:shadow-soft transition-all duration-200">
                                <FileText className="h-4 w-4" />
                                {t('builder.reportGenerator.guidelines')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <div className="space-y-4">
                                    <ContextSummary itemKey={itemKey} />
                                    <SectionGenerationControlsSummary sectionKey={itemKey as SectionNameType} />
                                    <GuidelinesSummary itemKey={itemKey} />
                                </div>
                            </AnimatedContainer>
                        </TabsContent>

                        <TabsContent value="context" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        {t('builder.reportGenerator.contextSelectionDesc')}
                                    </div>
                                    <ContextSelector itemKey={itemKey} />
                                </div>
                            </AnimatedContainer>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        {t('builder.reportGenerator.contextPreviewDesc')}
                                    </div>
                                    <ContextViewer itemKey={itemKey} />
                                </div>
                            </AnimatedContainer>
                        </TabsContent>

                        <TabsContent value="organized" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        {t('builder.reportGenerator.organizedContext')} - عرض السياقات المنظمة حسب نوع المعرفة والأهمية
                                    </div>
                                    <OrganizedContextDisplay
                                        organizedContext={organizedContext}
                                        itemKey={itemKey}
                                    />
                                </div>
                            </AnimatedContainer>
                        </TabsContent>

                        <TabsContent value="controls" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        {t('builder.reportGenerator.generationControlsDesc')}
                                    </div>
                                    <SectionGenerationControls sectionKey={itemKey as SectionNameType} />
                                </div>
                            </AnimatedContainer>
                        </TabsContent>

                        <TabsContent value="guidelines" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={200}>
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        {t('builder.reportGenerator.guidelinesDesc')}
                                    </div>
                                    <GuidelineEditor
                                        itemKey={itemKey}
                                        agentId={agent.id}
                                        isAdmin={false}
                                    />
                                </div>
                            </AnimatedContainer>
                        </TabsContent>
                    </Tabs>
                </AccordionContent>
            </AccordionItem>
        </AnimatedContainer>
    );
};
