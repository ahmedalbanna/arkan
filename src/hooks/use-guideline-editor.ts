'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { createUIHook } from '@/core';
import { useAgents, useGenerationUIStore } from '@/hooks';
import type { AgentGuideline, AgentPrompt } from '@/lib/models/agent';

/**
 * Encapsulates the logic for the GuidelineEditor component.
 * It fetches agent data, retrieves guideline state from the report store,
 * and provides the necessary data and handlers to the component.
 * @param itemKey - The unique key for the item (e.g., section name).
 * @param agentId - The ID of the agent whose guidelines are being edited.
 * @returns An object containing state and handlers for the GuidelineEditor component.
 */
export const useGuidelineEditor = (itemKey: string, agentId: string) => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const {
        guidelineState,
        customGuidelineInput,
        oneTimeInstructions,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        setOneTimeInstruction,
    } = useGenerationUIStore();

    // agent is now an instance of our Agent class
    const agent = agents.find(a => a.id === agentId);
    // Access prompt directly from the Agent instance
    const promptConfig = agent?.prompt as AgentPrompt | undefined;
    const hasGuidelines = !!promptConfig?.guidelines && promptConfig.guidelines.length > 0;
    const currentGuidelineState = guidelineState[itemKey];
    const oneTimeInstruction = oneTimeInstructions[itemKey];

    return {
        t,
        agentsLoaded,
        agent,
        promptConfig,
        hasGuidelines,
        currentGuidelineState,
        customGuidelineInput,
        oneTimeInstruction,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        setOneTimeInstruction,
    };
};

/**
 * Hook محسن لمحرر الإرشادات مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */

type AdvancedGuidelineEditorState = {
    itemKey: string;
    agentId: string;
    isEditing: boolean;
    isExpanded: boolean;
    hasChanges: boolean;
    validationErrors: string[];
    searchQuery: string;
    selectedGuidelines: string[];
};

export const useAdvancedGuidelineEditor = (itemKey: string, agentId: string) => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const {
        guidelineState,
        customGuidelineInput,
        oneTimeInstructions,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        setOneTimeInstruction,
    } = useGenerationUIStore();

    const uiHook = createUIHook<AdvancedGuidelineEditorState, any>({
        componentName: 'advanced-guideline-editor',
        initialState: {
            itemKey,
            agentId,
            isEditing: false,
            isExpanded: false,
            hasChanges: false,
            validationErrors: [],
            searchQuery: '',
            selectedGuidelines: [],
        },
        customLogic: (state, setState, toast) => {
            const handleToggleEdit = () => {
                setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
            };

            const handleToggleExpanded = () => {
                setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
            };

            const handleSaveChanges = () => {
                setState(prev => ({ ...prev, isEditing: false, hasChanges: false }));
                toast({ title: 'Guidelines saved successfully!' });
            };

            const handleCancelEdit = () => {
                setState(prev => ({ ...prev, isEditing: false, hasChanges: false }));
            };

            const handleSearch = (query: string) => {
                setState(prev => ({ ...prev, searchQuery: query }));
            };

            const handleSelectGuideline = (guidelineId: string) => {
                setState(prev => ({
                    ...prev,
                    selectedGuidelines: prev.selectedGuidelines.includes(guidelineId)
                        ? prev.selectedGuidelines.filter(id => id !== guidelineId)
                        : [...prev.selectedGuidelines, guidelineId]
                }));
            };

            const handleSelectAll = () => {
                const agent = agents.find(a => a.id === agentId);
                const promptConfig = agent?.prompt as AgentPrompt | undefined;
                const allGuidelineIds = promptConfig?.guidelines?.map(g => g.id).filter((id): id is string => !!id) || [];

                setState(prev => ({
                    ...prev,
                    selectedGuidelines: prev.selectedGuidelines.length === allGuidelineIds.length
                        ? []
                        : allGuidelineIds
                }));
            };

            const handleBulkToggle = (itemKey: string, guidelines: AgentGuideline[]) => {
                const allSelected = guidelines.every((g, index) => guidelineState[itemKey]?.checked[index]);
                guidelines.forEach((g, index) => {
                  handleGuidelineToggle(itemKey, index, !allSelected);
                });
                toast({ title: 'Guidelines toggled successfully!' });
              };

            const handleValidateGuidelines = () => {
                const errors: string[] = [];

                if (!itemKey) errors.push('Item key is required');
                if (!agentId) errors.push('Agent ID is required');
                if (!agents.find(a => a.id === agentId)) errors.push('Agent not found');

                setState(prev => ({ ...prev, validationErrors: errors }));
                return errors.length === 0;
            };

            const handleExportGuidelines = () => {
                const agent = agents.find(a => a.id === agentId);
                const promptConfig = agent?.prompt as AgentPrompt | undefined;
                const guidelines = promptConfig?.guidelines || [];
                const currentGuidelines = guidelineState[itemKey];

                const exportData = {
                    agentId,
                    agentName: agent?.name,
                    itemKey,
                    guidelines: guidelines.map((g, i) => ({
                        id: g.id,
                        title: g.title,
                        content: g.content,
                        enabled: currentGuidelines?.checked[i] ?? g.isDefault,
                    })),
                    customGuidelines: currentGuidelines?.custom || [],
                    oneTimeInstruction: oneTimeInstructions[itemKey] || ''
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `guidelines-${agentId}-${itemKey}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({ title: 'Guidelines exported successfully!' });
            };

            return {
                handleToggleEdit,
                handleToggleExpanded,
                handleSaveChanges,
                handleCancelEdit,
                handleSearch,
                handleSelectGuideline,
                handleSelectAll,
                handleBulkToggle,
                handleValidateGuidelines,
                handleExportGuidelines,
                isEditing: state.isEditing,
                isExpanded: state.isExpanded,
                hasChanges: state.hasChanges,
                validationErrors: state.validationErrors,
                searchQuery: state.searchQuery,
                selectedGuidelines: state.selectedGuidelines,
            };
        }
    })();

    // agent is now an instance of our Agent class
    const agent = agents.find(a => a.id === agentId);
    // Access prompt directly from the Agent instance
    const promptConfig = agent?.prompt as AgentPrompt | undefined;
    const hasGuidelines = !!promptConfig?.guidelines && promptConfig.guidelines.length > 0;
    const currentGuidelineState = guidelineState[itemKey];
    const oneTimeInstruction = oneTimeInstructions[itemKey];

    return {
        // الوظائف الأساسية
        t,
        agentsLoaded,
        agent,
        promptConfig,
        hasGuidelines,
        currentGuidelineState,
        customGuidelineInput,
        oneTimeInstruction,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
    }
}