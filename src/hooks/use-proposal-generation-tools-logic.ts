
'use client';

import type { AdvancedProposalFields, GuidelineState } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateProposal, useGenerationUIStore } from '@/hooks';
import { useEffect, useState } from 'react';
import { toast } from './use-toast';
import { useWritingTool } from './use-writing-tools';

export function useProposalGenerationToolsLogic() {
    // =============================================================================
    // HOOKS (MUST BE CALLED UNCONDITIONALLY)
    // =============================================================================
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');
    const project = useBuilderStore(p => p.project);
    const updateProject = useBuilderStore(p => p.updateProject);
    const uiStore = useGenerationUIStore();
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();

    const suggestIdeaMutation = useWritingTool('generate-text', {
        onSuccess: (data: any) => {
            if (project) {
                updateProject(p => { p.projectIdea = data.generatedText; });
                toast({ title: "Idea Suggested", description: "A new project idea has been generated for you." });
            }
        },
        onError: (error) => {
            toast({ title: "Failed to Suggest Idea", description: error.message, variant: 'destructive' });
        }
    });

    // Sync project data to UI store on mount. This hook is called unconditionally.
    useEffect(() => {
        // Guard inside the effect to prevent running logic if the project isn't ready.
        if (!project) return;

        const store = useGenerationUIStore.getState();
        if (project.advancedProposalFields) {
            Object.entries(project.advancedProposalFields).forEach(([key, value]) => {
                store.setAdvancedField(key as keyof AdvancedProposalFields, value || '');
            });
        }
        if (project.guidelineState) {
            store.setGuidelineState(project.guidelineState);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.id]); // Depend on the stable project ID.

    // =============================================================================
    // LOADING STATE (Early return if project is not loaded)
    // =============================================================================
    if (!project) {
        return {
            t,
            isProjectLoaded: false,
            activeTab, setActiveTab,
            projectIdea: '', setProjectIdea: () => {},
            customGuidelines: [], addCustomGuideline: () => {}, removeCustomGuideline: () => {}, customGuidelineInput: '', setCustomGuidelineInput: () => {},
            advancedFields: {},
            handleFieldChange: () => {},
            generationMutation: { isPending: false, mutate: () => {} },
            handleGenerateClick: () => {},
            canGenerate: false, hasCredits: false,
            suggestIdeaMutation: { isPending: false, mutate: () => {} },
            handleSuggestIdea: () => {}
        };
    }

    // =============================================================================
    // PROJECT-DEPENDENT LOGIC
    // =============================================================================
    const { projectIdea, contextManager } = project;
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const setProjectIdea = (idea: string) => updateProject(p => { p.projectIdea = idea; });

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof AdvancedProposalFields;
        
        uiStore.setAdvancedField(fieldName, value); // Update UI immediately
        updateProject(p => {
            p.advancedProposalFields = { ...p.advancedProposalFields, [fieldName]: value };
            p.hasUnsavedChanges = true;
        });
    };

    const handleAddGuideline = () => {
        uiStore.handleAddCustomGuidelineForItem('proposal');
        updateProject(p => { p.guidelineState = useGenerationUIStore.getState().guidelineState; p.hasUnsavedChanges = true; });
    };

    const handleRemoveGuideline = (index: number) => {
        uiStore.handleRemoveCustomGuidelineForItem('proposal', index);
        updateProject(p => { p.guidelineState = useGenerationUIStore.getState().guidelineState; p.hasUnsavedChanges = true; });
    };

    const handleGuidelineInputChange = (value: string) => {
        uiStore.setCustomGuidelineInputForItem('proposal', value);
        updateProject(p => { p.guidelineState = useGenerationUIStore.getState().guidelineState; p.hasUnsavedChanges = true; });
    };

    const handleGenerateClick = () => {
        const contextFiles = contextManager.getAll();
        const contextMarkdown = contextFiles.map(file => 
`---
File: ${file.fileName}
Type: ${file.type}
---

${file.content}`
        ).join('\n\n');

        const payload = {
            projectIdea: activeTab === 'simple' ? (projectIdea || '') : '',
            guidelines: uiStore.guidelineState['proposal']?.custom || [],
            contextMarkdown,
            advancedFields: uiStore.advancedProposalFields,
        };

        generationMutation.mutate(payload as any);
    };

    const handleSuggestIdea = () => {
        suggestIdeaMutation.mutate({ prompt: 'Suggest a random, interesting software project idea in one sentence.' });
    };

    const canGenerate = (activeTab === 'simple' && !!projectIdea) ||
        (activeTab === 'advanced' && !!uiStore.advancedProposalFields?.projectTitle && !!uiStore.advancedProposalFields?.projectObjective);

    return {
        t,
        isProjectLoaded: true,
        activeTab,
        setActiveTab,
        projectIdea,
        setProjectIdea,
        customGuidelines: uiStore.guidelineState['proposal']?.custom || [],
        addCustomGuideline: handleAddGuideline,
        removeCustomGuideline: handleRemoveGuideline,
        customGuidelineInput: uiStore.customGuidelineInput['proposal'] || '',
        setCustomGuidelineInput: handleGuidelineInputChange,
        advancedFields: uiStore.advancedProposalFields,
        handleFieldChange,
        generationMutation,
        handleGenerateClick,
        canGenerate,
        hasCredits,
        suggestIdeaMutation,
        handleSuggestIdea
    };
}
