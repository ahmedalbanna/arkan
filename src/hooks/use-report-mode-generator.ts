
'use client';

import type { SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import {
    toast, useAgents, useBuilderStore, useExport, useGenerationUIStore, useGenerateReportSection, useTranslate
} from '@/hooks';
import { AgentCategory } from '@/lib/models/agent';
import type { Section } from '@/lib/models/section';
import { useEffect, useMemo, useState } from 'react';

export const useReportModeGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
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

    useEffect(() => {
        setOrderedSections(report?.getOrderedSections() || []);
    }, [report]);

    const generatedSections = useMemo(
        () => (report?.getOrderedSections() || []).filter(section => {
            if (section && typeof section.hasContent === 'function') {
                return section.hasContent(); // Corrected: Call the function
            }
            return !!(section as any)?.content;
        }),
        [report]
    );

    const handleSectionUpdate = (key: SectionName, content: string) => {
        updateProject(p => {
            p.report.sectionsManager.updateSection(key, content);
            p.setUnsavedChanges(true);
        });
    };

    const handleSetOrderedSections = (newOrderedSections: Section[]) => {
        setOrderedSections(newOrderedSections);
        updateProject(p => {
            p.report.setSectionOrder(newOrderedSections.map(s => s.id));
            p.setUnsavedChanges(true);
        });
    }

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        if (!report) return;
        setIsTranslatingAll(true);
        toast({ title: 'Translating All Sections', description: 'This may take a moment...' });

        const sectionsToTranslate = report.getOrderedSections().filter(s => {
            if (s && typeof s.hasContent === 'function') {
                return s.hasContent(); // Corrected: Call the function
            }
            return !!(s as any)?.content;
        });

        const promises = sectionsToTranslate.map(section =>
            translateMutation.mutateAsync({ text: section.content!, targetLang })
                .then(result => ({ key: section.id, content: result.translatedText }))
        );

        const results = await Promise.all(promises);

        const newTranslations: Record<string, string> = {};
        results.forEach(result => {
            newTranslations[result.key] = result.content;
        });

        setTranslatedSections(newTranslations);
        setIsTranslatingAll(false);
        toast({ title: 'Translation Complete', description: 'All sections have been translated.' });
    };

    const handleExportReportDOCX = async (sectionsToInclude: SectionName[]) => {
        if (!project || !report || generatedSections.length === 0) return;
        await exportReportDocx(project, sectionsToInclude);
    };

    const { userProfile } = useAuth();
    const reportGenerationMutation = useGenerateReportSection();
    const { initializeDependentStates, getDependentStates } = useGenerationUIStore();

    useEffect(() => {
        if (agentsLoaded && reportAgents.length > 0) {
            const currentSections = report?.getOrderedSections();
            if (currentSections && currentSections.length > 0) {
                const generationStates = getDependentStates(currentSections.map(s => s.id));
                if (Object.keys(generationStates).length === 0) {
                    initializeDependentStates(reportAgents, currentSections);
                }
            }
        }
    }, [agentsLoaded, reportAgents, report, initializeDependentStates, getDependentStates]);

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
        hasCreditsForSingleSection: Boolean(userProfile && (userProfile.credits ?? 0) >= 1),
        agents: reportAgents,
        agentsLoaded,
        project,
        report,
        translatedSections,
    };
};