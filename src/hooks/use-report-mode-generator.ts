
'use client';

import type { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import {
    toast, useAgents, useBuilderStore, useExport, useGenerateReportSection, useGenerationUIStore, useTranslate
} from '@/hooks';
import { AgentCategory } from '@/lib/models/agent';
import { Section } from '@/lib/models/section';
import { useEffect, useMemo, useState } from 'react';

export const useReportModeGenerator = () => {
    const { t, locale } = useLocalization();
    const { project } = useBuilderStore();
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    const [translatedSections, setTranslatedSections] = useState<Record<string, string>>({});
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [orderedSections, setOrderedSections] = useState<Section[]>([]);
    const { exportReportDocx, isExporting } = useExport();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    const sectionsManager = project?.sections;

    const generatedSections = useMemo(
        () => (orderedSections || []).filter(section => sectionsManager?.getSection(section.id as SectionName)?.hasContent()),
        [sectionsManager, orderedSections]
    );

    const handleSectionUpdate = (key: SectionName, value: string) => {
        project?.sections.updateSection(key, value);
    };

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        if (!project?.sections) return;

        setIsTranslatingAll(true);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllStarted'),
            description: t('builder.reportGenerator.toasts.translateAllStartedDesc'),
        });

        const sectionKeys = (Object.keys(project.sections.toJSON()) as SectionName[])
            .filter(key => project.sections.getSection(key)?.hasContent());

        const translationPromises = sectionKeys.map(key => {
            const content = project.sections.getSection(key)!.content;
            return translateMutation.mutateAsync({ text: content, targetLang })
                .then(result => ({ key, content: result.translatedText }))
                .catch(error => ({ key, error }));
        });

        const results = await Promise.all(translationPromises);

        const translatedMap: Record<string, string> = {};
        results.forEach(result => {
            if ('content' in result) {
                translatedMap[result.key as SectionName] = result.content;
            } else {
                console.error(`Failed to translate section ${result.key}:`, result.error);
            }
        });

        setTranslatedSections(prev => ({ ...prev, ...translatedMap }));

        setIsTranslatingAll(false);
        toast({
            title: t('builder.reportGenerator.toasts.translateAllSuccess'),
            description: t('builder.reportGenerator.toasts.translateAllSuccessDesc'),
        });
    };

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || generatedSections.length === 0) return;

        const translatedTitles = reportAgents?.reduce((acc, agent) => {
            acc[agent.id as SectionName] = agent.name;
            return acc;
        }, {} as { [key in SectionName]?: string }) || {};

        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };

    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);
    const { initializeDependentStates, controlState, guidelineState, oneTimeInstructions } = useGenerationUIStore();
    const reportGenerationMutation = useGenerateReportSection();
    const isAnythingGenerating = reportGenerationMutation.isPending;

    const onGenerateSection = async (section: SectionName) => {
        if (!project) return;

        const otherDiagramsJSON = project.diagrams.toJSON();

        const body = {
            proposal: project.proposal?.toJSON(),
            projectPlan: project.projectPlan?.toJSON(),
            sectionToGenerate: section,
            otherSections: project.sections.toJSON(),
            otherDiagrams: Object.fromEntries(
                Object.entries(otherDiagramsJSON).map(([key, value]) => [key, value.code])
            ),
            exampleFiles: project.contextManager.getFiles().filter((c) => c.type === 'example'),
            contextFiles: project.contextManager.getFiles().filter((c) => c.type === 'context'),
            instructionText: oneTimeInstructions[section],
            controls: controlState[section],
            guidelines: guidelineState[section],
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body });
    };

    const hasCreditsForSingleSection = useMemo(() => Boolean(userProfile && (userProfile.credits ?? 0) >= 1), [userProfile]);

    useEffect(() => {
        if (agentsLoaded && agents.length > 0 && orderedSections.length > 0) {
            initializeDependentStates(agents.map(a => a.id), orderedSections.map(s => s.id));
        }
    }, [agentsLoaded, agents, orderedSections, initializeDependentStates]);

    useEffect(() => {
        if (!orderedSections.length && agentsLoaded) {
            const initialOrder = reportAgents.map(a => new Section({
                id: a.id.replace('generate-', '').replace('-section', ''),
                title: a.name,
                agentId: a.id,
                type: 'report',
                content: ''
            })).sort((a, b) => a.title.localeCompare(b.title));
            setOrderedSections(initialOrder);
        }
    }, [orderedSections.length, setOrderedSections, reportAgents, agentsLoaded]);

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
        sections: project?.sections.toJSON() || {},
        orderedSections,
        setOrderedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agents: reportAgents,
        agentsLoaded,
        project,
        translatedSections,
    };
};
