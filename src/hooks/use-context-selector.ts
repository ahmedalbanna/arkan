'use client';
import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSections } from '@/hooks';
import { useMemo } from 'react';
import { useGenerationUIStore } from './useGenerationUIStore';
import { type ContextFileData } from '@/lib/models/context-manager';

// Define a more specific type for the selection state
interface SelectionState {
    proposal: boolean;
    projectPlan: boolean;
    sections: Record<string, boolean>; // Use string for broader compatibility
    diagrams: Record<string, boolean>;
    externalContext: Record<number, boolean>; // Use a map for sparse selections
}

// Define an empty selection structure for initialization, now with a proper type.
const emptySelection: SelectionState = { sections: {}, diagrams: {}, externalContext: {}, proposal: false, projectPlan: false };

export const useContextSelector = (itemKey: string) => {
    const { t } = useLocalization();
    const project = useBuilderStore(s => s.project); // Select project from store
    const { toggleContextSelection, contextSelection } = useGenerationUIStore();
    const { data: sectionConfigs } = useSections();

    // If project is not loaded, return a fallback state to prevent crashes.
    if (!project) {
        return {
            t,
            proposal: null,
            projectPlan: null,
            toggleContextSelection: () => {},
            reportSections: {} as Record<string, any>,
            diagramSections: {} as Record<string, any>,
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

    const { proposal, projectPlan, report } = project;
    const { sectionsManager, diagramsManager, contextManager } = report;
    // CORRECTED: Use the public getAll() method instead of the private files property
    const externalContextFiles = contextManager.getAll();

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
        return (report.orderedSectionIds || [])
            .map(key => sectionsManager.getSection(key as SectionName))
            // CORRECTED: Call hasContent as a method
            .filter(section => section && section.hasContent())
            .map(section => section!.id as SectionName);
    }, [report.orderedSectionIds, sectionsManager]);

    const generatedDiagrams = useMemo(() => {
        const diagramsData = diagramsManager.toJSON();
        // TODO: This will be fixed when Diagram model is updated
        return (Object.keys(diagramsData.diagrams || {}) as DiagramType[]).filter(key => diagramsManager.getDiagram(key)?.hasContent());
    }, [diagramsManager]);

    const currentSelection: SelectionState = contextSelection[itemKey] || emptySelection;

    const selectedSections = useMemo(() =>
        (Object.keys(currentSelection.sections) as SectionName[]).flatMap(key => {
            if (currentSelection.sections[key]) {
                const section = sectionsManager.getSection(key);
                // CORRECTED: Call hasContent as a method
                if (section?.hasContent()) {
                    return [{ key, content: section.content }];
                }
            }
            return [];
        })
    , [currentSelection.sections, sectionsManager]);

    const selectedDiagrams = useMemo(() =>
        (Object.keys(currentSelection.diagrams) as DiagramType[]).flatMap(key => {
            if (currentSelection.diagrams[key]) {
                const diagram = diagramsManager.getDiagram(key);
                // TODO: This will be fixed when Diagram model is updated
                if (diagram?.hasContent()) {
                    return [{ key, content: diagram.plantUmlCode }];
                }
            }
            return [];
        })
    , [currentSelection.diagrams, diagramsManager]);
    
    const selectedExternalContext = useMemo(() =>
        externalContextFiles
            .map((item, index) => ({ ...item, index }))
            .filter((item) => !!currentSelection.externalContext[item.index])
    , [externalContextFiles, currentSelection.externalContext]);

    const hasContext = useMemo(() =>
        // TODO: This will be fixed when Proposal/Plan models are updated
        (currentSelection.proposal && (proposal?.hasContent() ?? false)) ||
        (currentSelection.projectPlan && (projectPlan?.hasContent() ?? false)) ||
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
        externalContext: externalContextFiles,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
        isProjectLoaded: true,
    };
};