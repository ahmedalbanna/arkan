'use client';
import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSections } from '@/hooks';
import { useMemo } from 'react';
import { useGenerationUIStore } from './useGenerationUIStore';

interface SelectionState {
    proposal: boolean;
    projectPlan: boolean;
    sections: Record<string, boolean>;
    diagrams: Record<string, boolean>;
    externalContext: Record<number, boolean>;
}

const emptySelection: SelectionState = { sections: {}, diagrams: {}, externalContext: {}, proposal: false, projectPlan: false };

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const project = useBuilderStore(s => s.project);
    const { toggleContextSelection, contextSelection } = useGenerationUIStore();
    const { data: sectionConfigs } = useSections();

    const proposal = project?.proposal;
    const projectPlan = project?.projectPlan;
    const report = project?.report;
    const sectionsManager = report?.sectionsManager;
    const diagramsManager = report?.diagramsManager;
    const contextManager = report?.contextManager;
    const externalContextFiles = contextManager?.getAll() || [];

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id as SectionName] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const diagramSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'diagram').reduce((acc, sec) => {
            acc[sec.id as DiagramType] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const generatedSections = useMemo(() => {
        if (!report?.orderedSectionIds || !sectionsManager) return [];
        return (report.orderedSectionIds || [])
            .map(key => sectionsManager.getSection(key as SectionName))
            .filter(section => section && section.hasContent())
            .map(section => section!.id as SectionName);
    }, [report?.orderedSectionIds, sectionsManager]);

    const generatedDiagrams = useMemo(() => {
        if (!diagramsManager) return [];
        const diagramsData = diagramsManager.toJSON();
        return (Object.keys(diagramsData.diagrams || {}) as DiagramType[]).filter(key => diagramsManager.getDiagram(key)?.hasContent());
    }, [diagramsManager]);

    const currentSelection: SelectionState = contextSelection[itemKey] || emptySelection;

    const selectedSections = useMemo(() => {
        if (!sectionsManager) return [];
        return (Object.keys(currentSelection.sections) as SectionName[]).flatMap(key => {
            if (currentSelection.sections[key]) {
                const section = sectionsManager.getSection(key);
                if (section?.hasContent()) {
                    return [{ key, content: section.content }];
                }
            }
            return [];
        });
    }, [currentSelection.sections, sectionsManager]);

    const selectedDiagrams = useMemo(() => {
        if (!diagramsManager) return [];
        return (Object.keys(currentSelection.diagrams) as DiagramType[]).flatMap(key => {
            if (currentSelection.diagrams[key]) {
                const diagram = diagramsManager.getDiagram(key);
                if (diagram?.hasContent()) {
                    return [{ key, content: diagram.plantUmlCode }];
                }
            }
            return [];
        });
    }, [currentSelection.diagrams, diagramsManager]);
    
    const selectedExternalContext = useMemo(() =>
        externalContextFiles
            .map((item, index) => ({ ...item, index }))
            .filter((item) => !!currentSelection.externalContext[item.index])
    , [externalContextFiles, currentSelection.externalContext]);

    const hasContext = useMemo(() =>
        (currentSelection.proposal && (proposal?.hasContent() ?? false)) ||
        (currentSelection.projectPlan && (projectPlan?.hasContent() ?? false)) ||
        (selectedSections?.length || 0) > 0 ||
        (selectedDiagrams?.length || 0) > 0 ||
        selectedExternalContext.length > 0,
    [currentSelection, proposal, projectPlan, selectedSections, selectedDiagrams, selectedExternalContext]);

    if (!project) {
        return {
            t,
            proposal: null,
            projectPlan: null,
            toggleContextSelection: () => {},
            reportSections: {},
            diagramSections: {},
            currentSelection: emptySelection,
            generatedSections: [],
            generatedDiagrams: [],
            externalContext: [],
            selectedSections: [],
            selectedDiagrams: [],
            selectedExternalContext: [],
            hasContext: false,
            isProjectLoaded: false,
        };
    }

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
        externalContext: externalContextFiles,
        selectedSections: selectedSections || [],
        selectedDiagrams: selectedDiagrams || [],
        selectedExternalContext,
        hasContext: hasContext || false,
        isProjectLoaded: true,
    };
};