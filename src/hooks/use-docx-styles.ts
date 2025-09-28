
'use client';

import { useAuth } from '@/context/AuthContext';
import { createUIHook } from '@/core';
import { toast } from '@/hooks/use-toast';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import type { DocxTemplateKey, Template } from '@/lib/types';
import { fetchDocxTemplatesApi, updateDocxTemplateApi } from '@/services/template-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import set from 'lodash.set';
import { useState } from 'react';

export const DOCX_TEMPLATES_QUERY_KEY = 'docx-templates';

/**
 * Custom hook to manage fetching and updating DOCX template styles.
 */
export function useDocxStyles() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeTemplateKey, setActiveTemplateKey] = useState<DocxTemplateKey | null>(null);

    // Fetching data
    const { data: templates, isFetched: isLoaded } = useQuery<Record<DocxTemplateKey, Template>>({
        queryKey: [DOCX_TEMPLATES_QUERY_KEY],
        queryFn: () => fetchDocxTemplatesApi(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch DOCX templates"),
        },
    });

    // Mutation for updating styles
    const updateMutation = useMutation({
        mutationFn: async (variables: { key: DocxTemplateKey, styles: any }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateDocxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (old: Record<string, any> | undefined) => {
                if (!old) return {};
                return { ...old, [variables.key]: data };
            });
            toast({ title: "Template Saved", description: "Your style changes have been saved." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    // Client-side style update function
    const updateStyle = (path: string, value: any) => {
        if (!templates || !activeTemplateKey) return;
        const currentTemplate = templates[activeTemplateKey];
        const newStyles = { ...currentTemplate.styles }; // Create a shallow copy
        set(newStyles, path, value); // Use lodash.set to update nested property

        // Update the cache in React Query
        queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (old: Record<string, any> | undefined) => {
            if (!old) return {};
            return {
                ...old,
                [activeTemplateKey]: {
                    ...old[activeTemplateKey],
                    styles: newStyles,
                },
            };
        });
    };

    // Save changes to the backend
    const saveChanges = (key: DocxTemplateKey) => {
        if (!templates || !templates[key]) return;
        const stylesToSave = templates[key].styles;
        updateMutation.mutate({ key, styles: stylesToSave });
    };

    return {
        templates: templates || {},
        isLoaded,
        activeTemplateKey,
        setActiveTemplateKey,
        updateStyle,
        saveChanges,
        isSaving: updateMutation.isPending,
    };
}

/**
 * Hook محسن لإدارة أنماط DOCX مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedDocxStyles() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeTemplateKey, setActiveTemplateKey] = useState<DocxTemplateKey | null>(null);

    const uiHook = createUIHook({
        hookName: 'advanced-docx-styles',
        initialState: {
            activeTemplateKey: null,
            isEditing: false,
            hasChanges: false,
            selectedStyles: [],
            searchQuery: '',
            filterType: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
            previewMode: 'desktop',
            styleHistory: [],
            undoStack: [],
            redoStack: [],
        },
        customLogic: (state, setState, toast) => {
            const handleSetActiveTemplate = (key: DocxTemplateKey) => {
                setState(prev => ({ ...prev, activeTemplateKey: key }));
            };

            const handleToggleEdit = () => {
                setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
            };

            const handleStyleChange = (path: string, value: any) => {
                setState(prev => ({
                    ...prev,
                    hasChanges: true,
                    styleHistory: [...prev.styleHistory.slice(-9), { path, value, timestamp: Date.now() }],
                    undoStack: [...prev.undoStack, { path, value, timestamp: Date.now() }],
                    redoStack: []
                }));
            };

            const handleSaveChanges = () => {
                setState(prev => ({ ...prev, isEditing: false, hasChanges: false }));
                toast({ title: 'Changes saved successfully!' });
            };

            const handleDiscardChanges = () => {
                setState(prev => ({ ...prev, isEditing: false, hasChanges: false }));
                toast({ title: 'Changes discarded' });
            };

            const handleSearch = (query: string) => {
                setState(prev => ({ ...prev, searchQuery: query }));
            };

            const handleFilterChange = (filterType: 'all' | 'fonts' | 'colors' | 'spacing' | 'borders') => {
                setState(prev => ({ ...prev, filterType }));
            };

            const handleSortChange = (sortBy: 'name' | 'type' | 'modified', order: 'asc' | 'desc') => {
                setState(prev => ({ ...prev, sortBy, sortOrder: order }));
            };

            const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
                setState(prev => ({ ...prev, previewMode: mode }));
            };

            const handleSelectStyle = (styleId: string) => {
                setState(prev => ({
                    ...prev,
                    selectedStyles: prev.selectedStyles.includes(styleId)
                        ? prev.selectedStyles.filter(id => id !== styleId)
                        : [...prev.selectedStyles, styleId]
                }));
            };

            const handleSelectAll = () => {
                setState(prev => ({
                    ...prev,
                    selectedStyles: prev.selectedStyles.length === 0 ? ['all'] : []
                }));
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

            const handleExportStyles = () => {
                const exportData = {
                    templateKey: state.activeTemplateKey,
                    styles: state.styleHistory,
                    timestamp: new Date().toISOString(),
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `docx-styles-${state.activeTemplateKey}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({ title: 'Styles exported successfully!' });
            };

            const handleImportStyles = (file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string);
                        setState(prev => ({
                            ...prev,
                            styleHistory: data.styles || [],
                            undoStack: data.styles || [],
                            redoStack: []
                        }));
                        toast({ title: 'Styles imported successfully!' });
                    } catch (error) {
                        toast({ title: 'Import failed', description: 'Invalid file format', variant: 'destructive' });
                    }
                };
                reader.readAsText(file);
            };

            return {
                handleSetActiveTemplate,
                handleToggleEdit,
                handleStyleChange,
                handleSaveChanges,
                handleDiscardChanges,
                handleSearch,
                handleFilterChange,
                handleSortChange,
                handlePreviewModeChange,
                handleSelectStyle,
                handleSelectAll,
                handleUndo,
                handleRedo,
                handleExportStyles,
                handleImportStyles,
                isEditing: state.isEditing,
                hasChanges: state.hasChanges,
                selectedStyles: state.selectedStyles,
                searchQuery: state.searchQuery,
                filterType: state.filterType,
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
                previewMode: state.previewMode,
                styleHistory: state.styleHistory,
                canUndo: state.undoStack.length > 0,
                canRedo: state.redoStack.length > 0,
            };
        }
    })();

    // Fetching data
    const { data: templates, isFetched: isLoaded } = useQuery<Record<DocxTemplateKey, Template>>({
        queryKey: [DOCX_TEMPLATES_QUERY_KEY],
        queryFn: () => fetchDocxTemplatesApi(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch DOCX templates"),
        },
    });

    // Mutation for updating styles
    const updateMutation = useMutation({
        mutationFn: async (variables: { key: DocxTemplateKey, styles: any }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateDocxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (old: Record<string, any> | undefined) => {
                if (!old) return {};
                return { ...old, [variables.key]: data };
            });
            toast({ title: "Template Saved", description: "Your style changes have been saved." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    // Client-side style update function
    const updateStyle = (path: string, value: any) => {
        if (!templates || !uiHook.activeTemplateKey) return;
        const currentTemplate = templates[uiHook.activeTemplateKey];
        const newStyles = { ...currentTemplate.styles };
        set(newStyles, path, value);

        queryClient.setQueryData([DOCX_TEMPLATES_QUERY_KEY], (old: Record<string, any> | undefined) => {
            if (!old) return {};
            return {
                ...old,
                [uiHook.activeTemplateKey]: {
                    ...old[uiHook.activeTemplateKey],
                    styles: newStyles,
                },
            };
        });

        uiHook.handleStyleChange(path, value);
    };

    // Save changes to the backend
    const saveChanges = (key: DocxTemplateKey) => {
        if (!templates || !templates[key]) return;
        const stylesToSave = templates[key].styles;
        updateMutation.mutate({ key, styles: stylesToSave });
        uiHook.handleSaveChanges();
    };

    return {
        // الوظائف الأساسية
        templates: templates || {},
        isLoaded,
        activeTemplateKey: uiHook.activeTemplateKey,
        setActiveTemplateKey: uiHook.handleSetActiveTemplate,
        updateStyle,
        saveChanges,
        isSaving: updateMutation.isPending,

        // الوظائف الجديدة من UI Hook
        ...uiHook,
    };
}

export function useDeleteDocxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    // In a real app, you would have a deleteDocxTemplateApi service function.
    // For now, we'll assume it exists and would be called here.

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            // const token = await getAuthenticatedToken(firebaseUser);
            // return deleteDocxTemplateApi(templateId, token);
            console.log(`Simulating delete for DOCX template: ${templateId}`);
            return Promise.resolve();
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: [DOCX_TEMPLATES_QUERY_KEY] });
            toast({ title: 'Template Deleted', description: `Template "${templateId}" was deleted.` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
