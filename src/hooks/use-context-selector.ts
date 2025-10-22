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
    externalContext: number[];
}

// Define an empty selection structure for initialization, now with a proper type.
const emptySelection: SelectionState = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

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
            // Ensure these are correctly typed, even when empty
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

    // Access data via managers from the project instance
    const { proposal, projectPlan, sections: sectionManager, diagrams: diagramManager, contextManager } = project;
    const externalContextFiles = contextManager.files;

    // Memoize UI-related data derived from section configurations
    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {} as Record<string, any>;
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id as SectionName] = sec;
            return acc;
        }, {} as Record<string, any>); // Use a correctly typed initial value
    }, [sectionConfigs]);

    const diagramSections = useMemo(() => {
        if (!sectionConfigs) return {} as Record<string, any>;
        return sectionConfigs.filter(s => s.type === 'diagram').reduce((acc, sec) => {
            acc[sec.id as DiagramType] = sec;
            return acc;
        }, {} as Record<string, any>); // Use a correctly typed initial value
    }, [sectionConfigs]);

    // Get available (generated) sections and diagrams from their managers
    const generatedSections = useMemo(() => 
        (Object.keys(sectionManager.toJSON()) as SectionName[]).filter(key => sectionManager.getSection(key)?.hasContent())
    , [sectionManager]);

    const generatedDiagrams = useMemo(() => 
        (Object.keys(diagramManager.toJSON()) as DiagramType[]).filter(key => diagramManager.getDiagram(key)?.hasContent())
    , [diagramManager]);

    // The selection state for the current item, defaulting to empty.
    const currentSelection: SelectionState = contextSelection[itemKey] || emptySelection;

    // Filter the selected items based on the current selection state.
    const selectedSections = useMemo(() =>
        (Object.keys(currentSelection.sections) as SectionName[])
            .filter(key => currentSelection.sections[key] && sectionManager.getSection(key)?.hasContent())
            .map(key => ({ key, content: sectionManager.getSection(key)!.content }))
    , [currentSelection.sections, sectionManager]);

    const selectedDiagrams = useMemo(() =>
        (Object.keys(currentSelection.diagrams) as DiagramType[])
            .filter(key => currentSelection.diagrams[key] && diagramManager.getDiagram(key)?.hasContent())
            .map(key => ({ key, content: diagramManager.getDiagram(key)!.plantUmlCode }))
    , [currentSelection.diagrams, diagramManager]);
    
    const selectedExternalContext = useMemo(() =>
        externalContextFiles
            .map((item, index) => ({ ...item, index })) // Attach index for selection tracking
            .filter((item: ContextFileData & { index: number }) => currentSelection.externalContext[item.index])
    , [externalContextFiles, currentSelection.externalContext]);

    // Determine if any context is selected.
    const hasContext = useMemo(() =>
        (currentSelection.proposal && !!proposal?.hasContent()) ||
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
        externalContext: externalContextFiles,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
        isProjectLoaded: true,
    };
};