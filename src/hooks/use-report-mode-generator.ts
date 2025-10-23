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
        () => (orderedSections || []).filter(section => sectionsManager?.getSection(section.id as SectionName)?.hasContent),
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
            .filter(key => project.sections.getSection(key)?.hasContent);

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
            if (agent && agent.id) {
              acc[agent.id as SectionName] = agent.name;
            }
            return acc;
        }, {} as { [key in SectionName]?: string }) || {};

        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };

    const { userProfile } = useAuth();
    // The reportGenerationMutation is the single source of truth for the generation state.
    // It will be passed down to child components to trigger generation.
    const reportGenerationMutation = useGenerateReportSection();
    const isAnythingGenerating = reportGenerationMutation.isPending;
    const { initializeDependentStates } = useGenerationUIStore();

    const hasCreditsForSingleSection = useMemo(() => Boolean(userProfile && (userProfile.credits ?? 0) >= 1), [userProfile]);

    useEffect(() => {
        if (agentsLoaded && reportAgents.length > 0 && orderedSections.length > 0) {
            initializeDependentStates(reportAgents, orderedSections);
        }
    }, [agentsLoaded, reportAgents, orderedSections, initializeDependentStates]);

    useEffect(() => {
        if (!orderedSections.length && agentsLoaded) {
            const sectionsMap = new Map<string, Section>();
            
            reportAgents.forEach(agent => {
                if (!agent || !agent.id) return;
                // Use a more consistent and robust way to generate the section ID
                const sectionId = agent.id
                    .replace(/^generate-/, '')
                    .replace(/-section$/, '')
                    .replace(/-diagram$/, '');
    
                // Ensure we only add one section per unique ID, preventing key duplication
                if (!sectionsMap.has(sectionId)) {
                    sectionsMap.set(sectionId, new Section({
                        id: sectionId,
                        title: agent.name,
                        agentId: agent.id,
                        type: 'report',
                        content: ''
                    }));
                }
            });
    
            const initialOrder = Array.from(sectionsMap.values())
                .sort((a, b) => a.title.localeCompare(b.title));
    
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
        reportGenerationMutation, // Expose the mutation object directly
        hasCreditsForSingleSection,
        agents: reportAgents,
        agentsLoaded,
        project,
        translatedSections,
    };
};