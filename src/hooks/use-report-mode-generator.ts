
'use client';

import type { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { createReportToolHook } from '@/core';
import { toast, useBuilderStore, useGenerateReportSection, useTranslate } from '@/hooks';
import { AgentCategory } from '@/lib/models/agent';
import { Project } from '@/lib/models/project';
import { Section } from '@/lib/models/section';
import { useEffect, useMemo, useState } from 'react';
import { useAgents } from './use-agents';
import { useExport } from './use-export';
import { useGenerationUIStore } from './useGenerationUIStore';


export const useReportModeGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, setProject } = useBuilderStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [orderedSections, setOrderedSections] = useState<Section[]>([]);

    const { exportReportDocx, isExporting } = useExport();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    // استخدام النظام الجديد من src/core
    const reportTool = createReportToolHook({
        toolName: 'report-generator',
        apiEndpoint: '/api/reports/generate',
        schema: require('zod').z.object({
            title: require('zod').z.string().min(5),
            sections: require('zod').z.array(require('zod').z.string()),
            data: require('zod').z.string().min(20)
        }),
        defaultValues: { title: '', sections: [], data: '' },
        reportType: 'analytical',
        successMessage: t('reportGenerator.success') || 'Report generated successfully!',
        errorMessage: t('reportGenerator.error') || 'Failed to generate report',
        customFeatures: {
            getReportSections: () => ['introduction', 'analysis', 'conclusion', 'recommendations'],
            validateReportStructure: (data: any) => {
                return data && data.sections && data.sections.length > 0 && data.content && data.content.length > 100;
            },
            formatReportOutput: (data: any) => {
                return {
                    title: data.title || 'Untitled Report',
                    sections: data.sections || [],
                    content: data.content || '',
                    metadata: {
                        type: 'analytical',
                        createdAt: new Date().toISOString(),
                        wordCount: data.content?.length || 0,
                        pageCount: Math.ceil((data.content?.length || 0) / 500)
                    }
                };
            }
        }
    })();

    const reportAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    const sections = project?.sections || {};

    const generatedSections = useMemo(
        () => (orderedSections || []).filter(section => sections[section.id as SectionName]),
        [sections, orderedSections]
    );

    const handleSectionUpdate = (key: SectionName, value: string) => {
        if (!project) return;
        setProject(new Project({ ...project.toStateObject(), sections: { ...project.sections, [key]: value } }));
    };

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        if (!project?.sections) return;

        setIsTranslatingAll(true);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllStarted'),
            description: t('builder.reportGenerator.toasts.translateAllStartedDesc'),
        });

        const sectionKeys = Object.keys(project.sections).filter(key => project.sections![key as SectionName]) as SectionName[];

        const translationPromises = sectionKeys.map(key => {
            const content = project.sections![key]!;
            return translateMutation.mutateAsync({ text: content, targetLang })
                .then(result => ({ key, content: result.translatedText }))
                .catch(error => ({ key, error }));
        });

        const results = await Promise.all(translationPromises);

        const translatedMap: { [key in SectionName]?: string } = {};
        results.forEach(result => {
            if ('content' in result) {
                translatedMap[result.key as SectionName] = result.content;
            } else {
                console.error(`Failed to translate section ${result.key}:`, result.error);
            }
        });

        setProject(new Project({ ...project.toJSON(), translatedSections: { ...project.translatedSections, ...translatedMap } }));

        setIsTranslatingAll(false);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllSuccess'),
            description: t('builder.reportGenerator.toasts.translateAllSuccessDesc'),
        });
    };

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || generatedSections.length === 0) return;

        const translatedTitles = reportAgents?.reduce((acc, agent) => {
            acc[agent.id as SectionName] = agent.name; // Use agent name directly
            return acc;
        }, {} as { [key in SectionName]?: string }) || {};

        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };

    // --- Start of logic from use-report-generation-logic ---
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);
    const { initializeDependentStates } = useGenerationUIStore();

    const reportGenerationMutation = useGenerateReportSection();
    const isAnythingGenerating = reportGenerationMutation.mutation.isPending;

    const onGenerateSection = async (section: SectionName) => {
        if (!project) return;

        const body = {
            proposal: project.proposal,
            projectPlan: project.projectPlan,
            sectionToGenerate: section,
            otherSections: project.sections,
            otherDiagrams: Object.fromEntries(Object.entries(project.diagrams || {}).map(([key, value]) => [key, value?.plantUmlCode])),
            exampleFiles: project.externalContext?.filter((c: any) => c.type === 'example'),
            contextFiles: project.externalContext?.filter((c: any) => c.type === 'context'),
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutation.mutate({ body });
    };

    const hasCreditsForSingleSection = useMemo(() => Boolean(userProfile && (userProfile.credits ?? 0) >= 1), [userProfile]);

    useEffect(() => {
        if (agentsLoaded && agents.length > 0 && orderedSections.length > 0) {
            initializeDependentStates(agents, orderedSections);
        }
    }, [agentsLoaded, agents, orderedSections, initializeDependentStates]);

    useEffect(() => {
        if (!orderedSections.length && agentsLoaded) {
            const initialOrder = reportAgents.map(a => new Section({
                id: a.id.replace('generate-', '').replace('-section', ''),
                title: a.name,
                agentId: a.id,
                type: 'report',
            })).sort((a, b) => a.title.localeCompare(b.title));
            setOrderedSections(initialOrder);
        }
    }, [orderedSections.length, setOrderedSections, reportAgents, agentsLoaded]);
    // --- End of logic from use-report-generation-logic ---


    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
        generatedSections,
        isExporting,
        handleExportReportDOCX,
        sections,
        orderedSections,
        setOrderedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agents: reportAgents,
        agentsLoaded,
        project,

        // النظام الجديد من src/core
        reportTool,
        reportToolProcessing: reportTool.isProcessing,
        reportToolProcessedText: reportTool.processedText,
        reportToolContent: reportTool.reportContent,
        reportToolCopied: reportTool.isCopied,
        reportToolHandleCopy: reportTool.handleCopy,
        reportToolOnSubmit: reportTool.onSubmit,
        reportToolReset: reportTool.reset,
        reportToolGetSections: reportTool.getReportSections,
        reportToolValidateStructure: reportTool.validateReportStructure,
        reportToolFormatOutput: reportTool.formatReportOutput,
    };
};
