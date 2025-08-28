'use client';

import { useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useProjectPlanStore } from '@/hooks';
import { useReportStore } from '@/hooks';
import { useDiagramStore } from '@/hooks';
import { useSectionStore } from '@/hooks';
import { type SectionName, type DiagramType, DiagramTypeSchema } from '@/ai/schemas';

const emptySelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { sections, externalContext, toggleContextSelection, contextSelection } = useReportStore();
    const { diagrams } = useDiagramStore();
    const { reportSections, diagramSections } = useSectionStore();

    const orderedSections = useMemo(() => Object.keys(reportSections).sort() as SectionName[], [reportSections]);
    const orderedDiagrams = DiagramTypeSchema.options;

    const currentSelection = contextSelection[itemKey] || emptySelection;

    const generatedSections = useMemo(() => orderedSections.filter(key => sections[key]), [orderedSections, sections]);
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams[key]), [orderedDiagrams, diagrams]);

    const selectedSections = useMemo(() => Object.keys(currentSelection.sections)
        .filter(key => currentSelection.sections[key] && sections[key as SectionName])
        .map(key => ({ key: key as SectionName, content: sections[key as SectionName]! })), [currentSelection.sections, sections]);

    const selectedDiagrams = useMemo(() => Object.keys(currentSelection.diagrams)
        .filter(key => currentSelection.diagrams[key] && diagrams[key as DiagramType])
        .map(key => ({ key: key as DiagramType, content: diagrams[key as DiagramType]!.plantUmlCode })), [currentSelection.diagrams, diagrams]);

    const selectedExternalContext = useMemo(() => (externalContext || [])
        .map((item, index) => ({ ...item, index }))
        .filter(item => currentSelection.externalContext[item.index]), [externalContext, currentSelection.externalContext]);

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
