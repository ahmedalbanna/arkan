'use client';

import { createUIHook } from '@/core';
import { useUpdateAgent } from '@/hooks';
import { agentEditorSchema, type AgentEditorFormValues } from '@/lib/agent-editor-schema';
import { Agent } from '@/lib/models/agent'; // NEW: Import our Agent class
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface UseAgentEditorProps {
    agentId: string;
    initialData: Agent; // NEW: Expect our Agent class instance
}

export function useAgentEditor({ agentId, initialData }: UseAgentEditorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const updateAgentMutation = useUpdateAgent();

    const form = useForm<AgentEditorFormValues>({
        resolver: zodResolver(agentEditorSchema),
        defaultValues: {
            name: initialData.name,
            category: initialData.category,
            prompt: initialData.prompt,
            toolIds: initialData.toolIds || [],
            knowledge: initialData.knowledge || [],
            introduction: initialData.introduction || '',
            placeholder: initialData.placeholder || 'Ask me anything...',
            conversationStarters: initialData.conversationStarters || [],
            tone: initialData.tone || 'Default',
            language: initialData.language || 'English (US)',
            model: initialData.model || 'googleai/gemini-2.0-flash',
        },
    });

    useEffect(() => {
        const promptFromUrl = searchParams.get('prompt');

        const getInitialPrompt = () => {
            // initialData.prompt is now guaranteed to be of type AgentPrompt | string
            if (typeof initialData.prompt === 'string') {
                return promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt;
            }
            if (typeof initialData.prompt === 'object') {
                const newBase = promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt.base;
                return { ...initialData.prompt, base: newBase };
            }
            return '';
        };

        form.reset({ ...form.getValues(), prompt: getInitialPrompt() });
    }, [initialData, searchParams, form]);

    const handleSubmit = (data: AgentEditorFormValues) => {
        updateAgentMutation.mutate({ agentId, payload: data });
    };

    return {
        form,
        isComplexPrompt: typeof form.watch('prompt') === 'object',
        isPending: updateAgentMutation.isPending,
        handleSubmit,
        router,
    };
}

/**
 * Hook محسن لمحرر الوكلاء مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedAgentEditor({ agentId, initialData }: UseAgentEditorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const updateAgentMutation = useUpdateAgent();

    const uiHook = createUIHook({
        hookName: 'advanced-agent-editor',
        initialState: {
            agentId,
            isEditing: false,
            hasChanges: false,
            selectedTab: 'general',
            validationErrors: [],
            searchQuery: '',
            filterType: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
            previewMode: 'desktop',
            editHistory: [],
            undoStack: [],
            redoStack: [],
            isSaving: false,
            saveProgress: 0,
        },
        customLogic: (state, setState, toast) => {
            const handleToggleEdit = () => {
                setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
            };

            const handleTabChange = (tab: 'general' | 'prompt' | 'tools' | 'knowledge' | 'settings') => {
                setState(prev => ({ ...prev, selectedTab: tab }));
            };

            const handleChange = (field: string, value: any) => {
                setState(prev => ({
                    ...prev,
                    hasChanges: true,
                    editHistory: [...prev.editHistory.slice(-9), { field, value, timestamp: Date.now() }],
                    undoStack: [...prev.undoStack, { field, value, timestamp: Date.now() }],
                    redoStack: []
                }));
            };

            const handleSave = () => {
                setState(prev => ({ ...prev, isSaving: true, saveProgress: 0 }));
                // Simulate save progress
                const interval = setInterval(() => {
                    setState(prev => {
                        if (prev.saveProgress >= 100) {
                            clearInterval(interval);
                            return { ...prev, isSaving: false, saveProgress: 100, hasChanges: false };
                        }
                        return { ...prev, saveProgress: prev.saveProgress + 10 };
                    });
                }, 100);
                toast({ title: 'Agent saved successfully!' });
            };

            const handleDiscardChanges = () => {
                setState(prev => ({ ...prev, isEditing: false, hasChanges: false }));
                toast({ title: 'Changes discarded' });
            };

            const handleSearch = (query: string) => {
                setState(prev => ({ ...prev, searchQuery: query }));
            };

            const handleFilterChange = (filterType: 'all' | 'tools' | 'knowledge' | 'prompts') => {
                setState(prev => ({ ...prev, filterType }));
            };

            const handleSortChange = (sortBy: 'name' | 'type' | 'modified', order: 'asc' | 'desc') => {
                setState(prev => ({ ...prev, sortBy, sortOrder: order }));
            };

            const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
                setState(prev => ({ ...prev, previewMode: mode }));
            };

            const handleUndo = () => {
                if (state.undoStack.length > 0) {
                    const lastChange = state.undoStack[state.undoStack.length - 1];
                    setState(prev => ({
                        ...prev,
                        undoStack: prev.undoStack.slice(0, -1),
                        redoStack: [...prev.redoStack, lastChange]
                    }));
                    toast({ title: 'Undo successful' });
                }
            };

            const handleRedo = () => {
                if (state.redoStack.length > 0) {
                    const nextChange = state.redoStack[state.redoStack.length - 1];
                    setState(prev => ({
                        ...prev,
                        redoStack: prev.redoStack.slice(0, -1),
                        undoStack: [...prev.undoStack, nextChange]
                    }));
                    toast({ title: 'Redo successful' });
                }
            };

            const handleExportAgent = () => {
                const exportData = {
                    agentId: state.agentId,
                    agentData: initialData.toJSON(),
                    editHistory: state.editHistory,
                    timestamp: new Date().toISOString(),
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `agent-${state.agentId}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({ title: 'Agent exported successfully!' });
            };

            const handleImportAgent = (file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string);
                        setState(prev => ({
                            ...prev,
                            editHistory: data.editHistory || [],
                            undoStack: data.editHistory || [],
                            redoStack: []
                        }));
                        toast({ title: 'Agent imported successfully!' });
                    } catch (error) {
                        toast({ title: 'Import failed', description: 'Invalid file format', variant: 'destructive' });
                    }
                };
                reader.readAsText(file);
            };

            const handleValidateAgent = () => {
                const errors: string[] = [];

                if (!state.agentId) errors.push('Agent ID is required');
                if (!initialData.name) errors.push('Agent name is required');
                if (!initialData.category) errors.push('Agent category is required');
                if (!initialData.prompt) errors.push('Agent prompt is required');

                setState(prev => ({ ...prev, validationErrors: errors }));
                return errors.length === 0;
            };

            const handleDuplicateAgent = () => {
                const duplicatedData = {
                    ...initialData.toJSON(),
                    id: `duplicate-${Date.now()}`,
                    name: `${initialData.name} (Copy)`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                toast({ title: 'Agent duplicated successfully!' });
                return duplicatedData;
            };

            return {
                handleToggleEdit,
                handleTabChange,
                handleChange,
                handleSave,
                handleDiscardChanges,
                handleSearch,
                handleFilterChange,
                handleSortChange,
                handlePreviewModeChange,
                handleUndo,
                handleRedo,
                handleExportAgent,
                handleImportAgent,
                handleValidateAgent,
                handleDuplicateAgent,
                isEditing: state.isEditing,
                hasChanges: state.hasChanges,
                selectedTab: state.selectedTab,
                validationErrors: state.validationErrors,
                searchQuery: state.searchQuery,
                filterType: state.filterType,
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
                previewMode: state.previewMode,
                editHistory: state.editHistory,
                canUndo: state.undoStack.length > 0,
                canRedo: state.redoStack.length > 0,
                isSaving: state.isSaving,
                saveProgress: state.saveProgress,
            };
        }
    })();

    const form = useForm<AgentEditorFormValues>({
        resolver: zodResolver(agentEditorSchema),
        defaultValues: {
            name: initialData.name,
            category: initialData.category,
            prompt: initialData.prompt,
            toolIds: initialData.toolIds || [],
            knowledge: initialData.knowledge || [],
            introduction: initialData.introduction || '',
            placeholder: initialData.placeholder || 'Ask me anything...',
            conversationStarters: initialData.conversationStarters || [],
            tone: initialData.tone || 'Default',
            language: initialData.language || 'English (US)',
            model: initialData.model || 'googleai/gemini-2.0-flash',
        },
    });

    useEffect(() => {
        const promptFromUrl = searchParams.get('prompt');

        const getInitialPrompt = () => {
            if (typeof initialData.prompt === 'string') {
                return promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt;
            }
            if (typeof initialData.prompt === 'object') {
                const newBase = promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt.base;
                return { ...initialData.prompt, base: newBase };
            }
            return '';
        };

        form.reset({ ...form.getValues(), prompt: getInitialPrompt() });
    }, [initialData, searchParams, form]);

    const handleSubmit = (data: AgentEditorFormValues) => {
        updateAgentMutation.mutate({ agentId, payload: data });
        uiHook.handleSave();
    };

    return {
        // الوظائف الأساسية
        form,
        isComplexPrompt: typeof form.watch('prompt') === 'object',
        isPending: updateAgentMutation.isPending,
        handleSubmit,
        router,

        // الوظائف الجديدة من UI Hook
        ...uiHook,
    };
}
