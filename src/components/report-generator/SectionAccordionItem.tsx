'use client';

import React, { useMemo } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSectionStore } from '@/hooks/useSectionStore';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks/useReportStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { GuidelineEditor } from '../generate/GuidelineEditor';
import { ContextSelector } from '../generate/ContextSelector';
import { SectionGenerationControls } from './SectionGenerationControls';

export const SectionAccordionItem = ({
    sectionKey,
    onGenerate,
    isGenerating,
    isAnythingGenerating,
    hasCredits,
}: {
    sectionKey: SectionNameType,
    onGenerate: (section: SectionNameType) => void,
    isGenerating: boolean,
    isAnythingGenerating: boolean,
    hasCredits: boolean,
}) => {
    const { t } = useLocalization();
    const { reportSections, getIconComponent } = useSectionStore();
    const { userProfile } = useAuth();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { externalContext, contextSelection } = useReportStore();

    const sectionConfig = reportSections[sectionKey];
    if (!sectionConfig) return null;

    const { title, agentId } = sectionConfig;
    const Icon = getIconComponent(sectionConfig.icon) || FileText;

    const currentSelection = contextSelection[sectionKey] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

    const hasSelectedContext = useMemo(() => {
        const sel = currentSelection;
        const hasSections = Object.values(sel.sections || {}).some(v => v);
        const hasDiagrams = Object.values(sel.diagrams || {}).some(v => v);
        const hasExternal = (externalContext || []).filter((_, i) => sel.externalContext?.[i]).length > 0;

        return (sel.proposal && !!proposal) ||
               (sel.projectPlan && !!projectPlan) ||
               hasSections ||
               hasDiagrams ||
               hasExternal;
    }, [proposal, projectPlan, currentSelection, externalContext]);

    const disabledReason = !hasCredits ? t('builder.toasts.insufficientCredits')
                         : !hasSelectedContext ? "Please select a context (like the proposal) to generate this section."
                         : null;

    return (
        <AccordionItem value={sectionKey} key={sectionKey}>
            <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                <div className="flex items-center gap-2">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
                    {t(title)}
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 p-4">
                <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="prompt">{t('builder.reportGenerator.tool_tab_prompt')}</TabsTrigger>
                        <TabsTrigger value="controls">{t('builder.reportGenerator.tool_tab_controls')}</TabsTrigger>
                        <TabsTrigger value="context">{t('builder.reportGenerator.tool_tab_context')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="prompt" className="pt-4 space-y-4">
                        <GuidelineEditor itemKey={sectionKey} agentId={agentId} isAdmin={userProfile?.role === 'admin'} />
                    </TabsContent>
                    <TabsContent value="controls" className="pt-4">
                        <SectionGenerationControls sectionKey={sectionKey} />
                    </TabsContent>
                    <TabsContent value="context" className="pt-4">
                        <ContextSelector itemKey={sectionKey} />
                    </TabsContent>
                </Tabs>
                <div className="pt-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button
                                        type="button"
                                        onClick={() => onGenerate(sectionKey)}
                                        disabled={isAnythingGenerating || !hasSelectedContext || !hasCredits}
                                        className="font-headline w-full"
                                    >
                                        {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                                        {`${t('builder.reportGenerator.generateButton')} ${t(title)}`}
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
            </AccordionContent>
        </AccordionItem>
    );
};
