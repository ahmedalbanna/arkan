
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { createUIHook } from '@/core';
import { useBuilderStore, useDeleteProject } from '@/hooks';
import type { Project } from '@/lib/models/project';
import { useRouter } from 'next/navigation';

/**
 * Hook محسن لإدارة بطاقات المشاريع
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useProjectCardLogic(project: Project) {
    const router = useRouter();
    const { t } = useLocalization();
    const { loadProject } = useBuilderStore();

    const deleteProjectMutation = useDeleteProject();

    const handleLoadProject = () => {
        // The store's loadProject action expects a plain object
        loadProject(project.toStateObject());
        router.push('/generate');
    };

    const handleDeleteProject = () => {
        deleteProjectMutation.mutate(project.id);
    };

    const projectTitle = project.name || project.proposal?.title || t('projects.untitled');
    const isDeletingThisProject = deleteProjectMutation.isPending && deleteProjectMutation.variables === project.id;

    const uiHook = createUIHook({
        hookName: 'project-card',
        initialState: {
            project,
            projectTitle,
            isDeletingThisProject,
            isExpanded: false,
            isEditing: false,
            showDeleteConfirm: false,
        },
        customLogic: (state, setState, toast) => {
            const handleToggleExpanded = () => {
                setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
            };

            const handleEdit = () => {
                setState(prev => ({ ...prev, isEditing: true }));
            };

            const handleSave = () => {
                setState(prev => ({ ...prev, isEditing: false }));
                toast({ title: 'Project updated successfully!' });
            };

            const handleCancel = () => {
                setState(prev => ({ ...prev, isEditing: false }));
            };

            const handleShowDeleteConfirm = () => {
                setState(prev => ({ ...prev, showDeleteConfirm: true }));
            };

            const handleCancelDelete = () => {
                setState(prev => ({ ...prev, showDeleteConfirm: false }));
            };

            const handleConfirmDelete = () => {
                handleDeleteProject();
                setState(prev => ({ ...prev, showDeleteConfirm: false }));
            };

            const handleDuplicate = () => {
                // Logic to duplicate project
                toast({ title: 'Project duplicated successfully!' });
            };

            const handleShare = () => {
                // Logic to share project
                toast({ title: 'Project shared successfully!' });
            };

            const handleExport = () => {
                // Logic to export project
                toast({ title: 'Project exported successfully!' });
            };

            return {
                handleToggleExpanded,
                handleEdit,
                handleSave,
                handleCancel,
                handleShowDeleteConfirm,
                handleCancelDelete,
                handleConfirmDelete,
                handleDuplicate,
                handleShare,
                handleExport,
                isExpanded: state.isExpanded,
                isEditing: state.isEditing,
                showDeleteConfirm: state.showDeleteConfirm,
            };
        }
    })();

    return {
        // الوظائف الأساسية
        handleLoadProject,
        handleDeleteProject,
        projectTitle,
        isDeletingThisProject,
        t,

        // الوظائف الجديدة من UI Hook
        ...uiHook,
    };
}
