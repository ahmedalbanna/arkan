'use client';
import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSections } from '@/hooks';
import { useMemo } from 'react';
import { useGenerationUIStore } from './useGenerationUIStore';
const emptySelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { toggleContextSelection, contextSelection } = useGenerationUIStore();
    const { data: sectionConfigs } = useSections();

    // Access data directly from the project instance
    const proposal = project?.proposal;
    const projectPlan = project?.projectPlan;
    const allSections = project?.sections || {};
    const allDiagrams = project?.diagrams || {};
    const externalContext = project?.externalContext || [];
    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const diagramSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'diagram').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const orderedSections = useMemo(() => Object.keys(allSections).sort() as SectionName[], [allSections]);
    const orderedDiagrams = useMemo(() => Object.keys(allDiagrams).sort() as DiagramType[], [allDiagrams]);


    const currentSelection = contextSelection[itemKey] || emptySelection;

    const generatedSections = useMemo(() => orderedSections.filter(key => allSections[key]), [orderedSections, allSections]);
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => allDiagrams[key]), [orderedDiagrams, allDiagrams]);

    const selectedSections = useMemo(() => Object.keys(currentSelection.sections)
        .filter(key => currentSelection.sections[key] && allSections[key as SectionName])
        .map(key => ({ key: key as SectionName, content: allSections[key as SectionName]! })), [currentSelection.sections, allSections]);

    const selectedDiagrams = useMemo(() => Object.keys(currentSelection.diagrams)
        .filter(key => currentSelection.diagrams[key] && allDiagrams[key as DiagramType])
        .map(key => ({ key: key as DiagramType, content: allDiagrams[key as DiagramType]!.plantUmlCode })), [currentSelection.diagrams, allDiagrams]);

    const selectedExternalContext = useMemo(() => (externalContext || [])
        .map((item, index) => ({ ...item, index }))
        .filter((item: any) => currentSelection.externalContext[item.index]), [externalContext, currentSelection.externalContext]);

    const hasContext = useMemo(() =>
        (currentSelection.proposal && !!proposal) ||
        (currentSelection.projectPlan && !!projectPlan) ||
        selectedSections.length > 0 ||
        selectedDiagrams.length > 0 ||
        selectedExternalContext.length > 0,
        [currentSelection, proposal, projectPlan, selectedSections, selectedDiagrams, selectedExternalContext]
    );

    return {
        t,
        proposal,
        projectPlan,
        toggleContextSelection,
        reportSections,
        diagramSections,
        currentSelection,
        generatedSections,
        generatedDiagrams,
        externalContext,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
    };
};
