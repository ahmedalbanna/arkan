
'use client';

import { useAuth } from '@/context/AuthContext';
import { createUIHook } from '@/core';
import { toast } from '@/hooks';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { templateKeys } from '@/lib/core/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import type { PptxTemplate } from '@/lib/models/pptxTemplate';
import type { PptxStyleOptions, PptxTemplateKey } from '@/lib/types';
import { deletePptxTemplateApi, fetchPptxTemplatesApi, updatePptxTemplateApi, uploadPptxTemplateFileApi } from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import set from 'lodash.set';
import { useState } from 'react';

export function usePptxStyles() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeTemplateKey, setActiveTemplateKey] = useState<PptxTemplateKey | null>(null);

    const { data: templates, isFetched: isLoaded } = useQuery<Record<PptxTemplateKey, PptxTemplate>>({
        queryKey: templateKeys.pptx(),
        queryFn: () => fetchPptxTemplatesApi(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch PPTX templates"),
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: { key: PptxTemplateKey, styles: PptxStyleOptions }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePptxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(templateKeys.pptx(), (old: Record<string, PptxTemplate> | undefined) => {
                if (!old) return {};
                return { ...old, [variables.key]: data };
            });
            toast({ title: "Template Saved", description: "Your style changes have been saved." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    const uploadTemplateFile = useMutation({
        mutationFn: async (variables: { templateId: string; file: File }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return uploadPptxTemplateFileApi(variables.templateId, variables.file, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
            toast({ title: "Template File Uploaded", description: `The .pptx file has been updated for template ID: ${data.id}` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to upload template file");
        }
    });

    const updateStyle = (key: PptxTemplateKey, path: string, value: any) => {
        if (!templates) return;
        const currentTemplate = templates[key];
        const newStyles = { ...currentTemplate.styles };
        set(newStyles, path, value);
        queryClient.setQueryData(templateKeys.pptx(), (old: Record<string, PptxTemplate> | undefined) => {
            if (!old) return {};
            return {
                ...old,
                [key]: {
                    ...old[key],
                    styles: newStyles,
                },
            };
        });
    };

    const saveChanges = (key: PptxTemplateKey) => {
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
        uploadTemplateFile,
    };
}

/**
 * Hook محسن لإدارة أنماط PPTX مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedPptxStyles() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeTemplateKey, setActiveTemplateKey] = useState<PptxTemplateKey | null>(null);

    const uiHook = createUIHook({
        hookName: 'advanced-pptx-styles',
        initialState: {
            activeTemplateKey: null,
            isEditing: false,
            hasChanges: false,
            selectedSlides: [],
            searchQuery: '',
            filterType: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
            previewMode: 'desktop',
            slideHistory: [],
            undoStack: [],
            redoStack: [],
            isUploading: false,
            uploadProgress: 0,
        },
        customLogic: (state, setState, toast) => {
            const handleSetActiveTemplate = (key: PptxTemplateKey) => {
                setState(prev => ({ ...prev, activeTemplateKey: key }));
            };

            const handleToggleEdit = () => {
                setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
            };

            const handleSlideChange = (slideId: string, path: string, value: any) => {
                setState(prev => ({
                    ...prev,
                    hasChanges: true,
                    slideHistory: [...prev.slideHistory.slice(-9), { slideId, path, value, timestamp: Date.now() }],
                    undoStack: [...prev.undoStack, { slideId, path, value, timestamp: Date.now() }],
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

            const handleFilterChange = (filterType: 'all' | 'slides' | 'masters' | 'layouts' | 'themes') => {
                setState(prev => ({ ...prev, filterType }));
            };

            const handleSortChange = (sortBy: 'name' | 'type' | 'modified', order: 'asc' | 'desc') => {
                setState(prev => ({ ...prev, sortBy, sortOrder: order }));
            };

            const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
                setState(prev => ({ ...prev, previewMode: mode }));
            };

            const handleSelectSlide = (slideId: string) => {
                setState(prev => ({
                    ...prev,
                    selectedSlides: prev.selectedSlides.includes(slideId)
                        ? prev.selectedSlides.filter(id => id !== slideId)
                        : [...prev.selectedSlides, slideId]
                }));
            };

            const handleSelectAll = () => {
                setState(prev => ({
                    ...prev,
                    selectedSlides: prev.selectedSlides.length === 0 ? ['all'] : []
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

            const handleExportTemplate = () => {
                const exportData = {
                    templateKey: state.activeTemplateKey,
                    slides: state.slideHistory,
                    timestamp: new Date().toISOString(),
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `pptx-template-${state.activeTemplateKey}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({ title: 'Template exported successfully!' });
            };

            const handleImportTemplate = (file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string);
                        setState(prev => ({
                            ...prev,
                            slideHistory: data.slides || [],
                            undoStack: data.slides || [],
                            redoStack: []
                        }));
                        toast({ title: 'Template imported successfully!' });
                    } catch (error) {
                        toast({ title: 'Import failed', description: 'Invalid file format', variant: 'destructive' });
                    }
                };
                reader.readAsText(file);
            };

            const handleUploadStart = () => {
                setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
            };

            const handleUploadProgress = (progress: number) => {
                setState(prev => ({ ...prev, uploadProgress: progress }));
            };

            const handleUploadComplete = () => {
                setState(prev => ({ ...prev, isUploading: false, uploadProgress: 100 }));
                toast({ title: 'Template uploaded successfully!' });
            };

            const handleUploadError = () => {
                setState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
                toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
            };

            return {
                handleSetActiveTemplate,
                handleToggleEdit,
                handleSlideChange,
                handleSaveChanges,
                handleDiscardChanges,
                handleSearch,
                handleFilterChange,
                handleSortChange,
                handlePreviewModeChange,
                handleSelectSlide,
                handleSelectAll,
                handleUndo,
                handleRedo,
                handleExportTemplate,
                handleImportTemplate,
                handleUploadStart,
                handleUploadProgress,
                handleUploadComplete,
                handleUploadError,
                isEditing: state.isEditing,
                hasChanges: state.hasChanges,
                selectedSlides: state.selectedSlides,
                searchQuery: state.searchQuery,
                filterType: state.filterType,
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
                previewMode: state.previewMode,
                slideHistory: state.slideHistory,
                canUndo: state.undoStack.length > 0,
                canRedo: state.redoStack.length > 0,
                isUploading: state.isUploading,
                uploadProgress: state.uploadProgress,
            };
        }
    })();

    const { data: templates, isFetched: isLoaded } = useQuery<Record<PptxTemplateKey, PptxTemplate>>({
        queryKey: templateKeys.pptx(),
        queryFn: () => fetchPptxTemplatesApi(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        meta: {
            onError: (error: Error) => handleErrorUtility(error, "Failed to fetch PPTX templates"),
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: { key: PptxTemplateKey, styles: PptxStyleOptions }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updatePptxTemplateApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(templateKeys.pptx(), (old: Record<string, PptxTemplate> | undefined) => {
                if (!old) return {};
                return { ...old, [variables.key]: data };
            });
            toast({ title: "Template Saved", description: "Your style changes have been saved." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to save template");
        }
    });

    const uploadTemplateFile = useMutation({
        mutationFn: async (variables: { templateId: string; file: File }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return uploadPptxTemplateFileApi(variables.templateId, variables.file, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
            toast({ title: "Template File Uploaded", description: `The .pptx file has been updated for template ID: ${data.id}` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to upload template file");
        }
    });

    const updateStyle = (key: PptxTemplateKey, path: string, value: any) => {
        if (!templates) return;
        const currentTemplate = templates[key];
        const newStyles = { ...currentTemplate.styles };
        set(newStyles, path, value);
        queryClient.setQueryData(templateKeys.pptx(), (old: Record<string, PptxTemplate> | undefined) => {
            if (!old) return {};
            return {
                ...old,
                [key]: {
                    ...old[key],
                    styles: newStyles,
                },
            };
        });

        uiHook.handleSlideChange(key, path, value);
    };

    const saveChanges = (key: PptxTemplateKey) => {
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
        uploadTemplateFile,

        // الوظائف الجديدة من UI Hook
        ...uiHook,
    };
}

export function useDeletePptxTemplate() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (templateId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deletePptxTemplateApi(templateId, token);
        },
        onSuccess: (data, templateId) => {
            queryClient.invalidateQueries({ queryKey: templateKeys.pptx() });
            toast({ title: "Template Deleted", description: `Template "${templateId}" was deleted.` });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete template");
        }
    });
}
