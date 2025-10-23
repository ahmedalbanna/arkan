'use client';

import type { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import {
    toast, useAgents, useBuilderStore, useExport, useGenerateReportSection, useGenerationUIStore, useTranslate
} from '@/hooks';
import { AgentCategory } from '@/lib/models/agent';
import { ProjectReport } from '@/lib/models/project-report'; // Updated import
import type { Section } from '@/lib/models/section';
import { useEffect, useMemo, useState } from 'react';

export const useReportModeGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    
    // The report model is now correctly typed as ProjectReport
    const report = useMemo(() => project?.report, [project]);
    
    const translateMutation = useTranslate();
    const [isTranslatingAll, setIsTranslatingAll] = useState(false);
    const [translatedSections, setTranslatedSections] = useState<Record<string, string>>({});
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    
    const [orderedSections, setOrderedSections] = useState<Section[]>(report?.getOrderedSections() || []);
    
    const { exportReportDocx, isExporting } = useExport();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    // Sync local UI state when the canonical report changes.
    useEffect(() => {
        setOrderedSections(report?.getOrderedSections() || []);
    }, [report]);

    const generatedSections = useMemo(
        () => (report?.getOrderedSections() || []).filter(section => section.hasContent),
        [report]
    );

    const handleSectionUpdate = (key: SectionName, value: string) => {
        updateProject(p => p.report.sectionsManager.updateSection(key, value));
    };

    const handleSetOrderedSections = (newOrderedSections: Section[]) => {
        setOrderedSections(newOrderedSections); // Update local UI immediately
        updateProject(p => p.report.setSectionOrder(newOrderedSections.map(s => s.id)));
    }

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        if (!report) return;

        setIsTranslatingAll(true);
        toast({ /* ... */ });

        const sectionsToTranslate = report.getOrderedSections().filter(s => s.hasContent);
        const translationPromises = sectionsToTranslate.map(section => 
            translateMutation.mutateAsync({ text: section.content!, targetLang })
                .then(result => ({ key: section.id, content: result.translatedText }))
                .catch(error => ({ key: section.id, error }))
        );

        const results = await Promise.all(translationPromises);
        // ... (rest of the logic is the same)
    };

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || !report || generatedSections.length === 0) return;

        const translatedTitles = { /* ... */ };
        await exportReportDocx(project, translatedTitles, sectionsToInclude);
    };

    const { userProfile } = useAuth();
    const reportGenerationMutation = useGenerateReportSection();
    const { initializeDependentStates } = useGenerationUIStore();

    const hasCreditsForSingleSection = useMemo(() => Boolean(userProfile && (userProfile.credits ?? 0) >= 1), [userProfile]);

    useEffect(() => {
        if (agentsLoaded && reportAgents.length > 0) {
            const currentSections = report?.getOrderedSections();
            if (currentSections && currentSections.length > 0) {
                 initializeDependentStates(reportAgents, currentSections);
            }
        }
    }, [agentsLoaded, reportAgents, report, initializeDependentStates]);

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
        sections: report?.sectionsManager.toJSON() || {},
        orderedSections,
        setOrderedSections: handleSetOrderedSections,
        isAnythingGenerating: reportGenerationMutation.isPending,
        reportGenerationMutation,
        hasCreditsForSingleSection,
        agents: reportAgents,
        agentsLoaded,
        project,
        report, // The type is now correctly inferred as ProjectReport | undefined
        translatedSections,
    };
};