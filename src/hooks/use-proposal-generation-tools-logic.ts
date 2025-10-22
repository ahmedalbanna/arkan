
'use client';

import { completeProposalFieldsFlow } from '@/ai/flows/complete-proposal-fields';
import { type ProposalCompletionOutput } from '@/ai/schemas/proposal-completion';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateProposal, useGenerationUIStore, type AdvancedProposalFields } from '@/hooks';
import { useEffect, useMemo, useState } from 'react';
import { toast } from './use-toast';
import { useFlow } from './use-writing-tools'; // Renamed from useWritingTool for clarity

// A list of all advanced field keys, used for checking completion status.
const advancedFieldKeys: (keyof AdvancedProposalFields)[] = [
    'projectTitle', 'projectObjective', 'expectedOutcomes', 'stakeholders',
    'projectContext', 'risksAndChallenges', 'projectRationale', 'additionalContext',
    'methodology', 'timeline', 'budget'
];

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

    const suggestIdeaMutation = useFlow<any, ProposalCompletionOutput>(completeProposalFieldsFlow, {
        onSuccess: (data) => {
            if (project) {
                updateProject(p => {
                    // Update all fields from the AI response
                    p.projectIdea = data.projectIdea;
                    p.advancedProposalFields = data.advancedFields;
                    p.hasUnsavedChanges = true;
                });

                // Also update the UI store to match
                const store = useGenerationUIStore.getState();
                store.setAdvancedField('projectTitle', data.advancedFields.projectTitle);
                Object.entries(data.advancedFields).forEach(([key, value]) => {
                    store.setAdvancedField(key as keyof AdvancedProposalFields, value || '');
                });

                toast({ title: "Proposal Fields Completed", description: "The AI has filled in the missing fields for you." });
            }
        },
        onError: (error) => {
            toast({ title: "Failed to Complete Fields", description: error.message, variant: 'destructive' });
        }
    });

    useEffect(() => {
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
    }, [project?.id]);

    // =============================================================================
    // LOADING STATE
    // =============================================================================
    if (!project) {
        return { t, isProjectLoaded: false, activeTab, setActiveTab, projectIdea: '', setProjectIdea: () => {}, customGuidelines: [], addCustomGuideline: () => {}, removeCustomGuideline: () => {}, customGuidelineInput: '', setCustomGuidelineInput: () => {}, advancedFields: {}, handleFieldChange: () => {}, generationMutation: { isPending: false, mutate: () => {} }, handleGenerateClick: () => {}, canGenerate: false, hasCredits: false, suggestIdeaMutation: { isPending: false, mutate: () => {} }, handleSuggestIdea: () => {}, isSuggestionDisabled: true };
    }

    // =============================================================================
    // PROJECT-DEPENDENT LOGIC
    // =============================================================================
    const { projectIdea, contextManager, advancedProposalFields } = project;
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const setProjectIdea = (idea: string) => updateProject(p => { p.projectIdea = idea; });

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof AdvancedProposalFields;
        uiStore.setAdvancedField(fieldName, value);
        updateProject(p => { p.advancedProposalFields = { ...p.advancedProposalFields, [fieldName]: value }; p.hasUnsavedChanges = true; });
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
    };

    const handleGenerateClick = () => {
        const contextFiles = contextManager.getAll();
        const contextMarkdown = contextFiles.map(file => `---\nFile: ${file.fileName}\nType: ${file.type}\n---\n\n${file.content}`).join('\n\n');
        const payload = { projectIdea: activeTab === 'simple' ? (projectIdea || '') : '', guidelines: uiStore.guidelineState['proposal']?.custom || [], contextMarkdown, advancedFields: uiStore.advancedProposalFields };
        generationMutation.mutate(payload as any);
    };

    const handleSuggestIdea = () => {
        const currentState = {
            projectIdea: project.projectIdea || '',
            advancedFields: project.advancedProposalFields || {},
        };
        suggestIdeaMutation.mutate(currentState);
    };

    const isSuggestionDisabled = useMemo(() => {
        const isIdeaEmpty = !project.projectIdea?.trim();
        const areAllAdvancedFieldsFilled = advancedFieldKeys.every(
            key => project.advancedProposalFields && project.advancedProposalFields[key]?.trim()
        );
        return !isIdeaEmpty && areAllAdvancedFieldsFilled;
    }, [project.projectIdea, project.advancedProposalFields]);

    const canGenerate = (activeTab === 'simple' && !!projectIdea) || (activeTab === 'advanced' && !!uiStore.advancedProposalFields?.projectTitle && !!uiStore.advancedProposalFields?.projectObjective);

    return {
        t, isProjectLoaded: true, activeTab, setActiveTab,
        projectIdea, setProjectIdea,
        customGuidelines: uiStore.guidelineState['proposal']?.custom || [],
        addCustomGuideline: handleAddGuideline, removeCustomGuideline: handleRemoveGuideline,
        customGuidelineInput: uiStore.customGuidelineInput['proposal'] || '',
        setCustomGuidelineInput: handleGuidelineInputChange,
        advancedFields: uiStore.advancedProposalFields,
        handleFieldChange, generationMutation, handleGenerateClick, canGenerate, hasCredits,
        suggestIdeaMutation, handleSuggestIdea, isSuggestionDisabled,
    };
}
