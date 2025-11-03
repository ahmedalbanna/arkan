
'use client';

import { useState, useRef } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject, useExport, useToast } from '@/hooks';

export function useSessionActions() {
    const { t } = useLocalization();
    const { toast } = useToast();
    const { project, loadProject, newSession } = useBuilderStore();
    const { saveProject, isSaving, createMutation, updateMutation } = useSaveProject();
    const { isExporting, exportReportDocx } = useExport();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [saveAsName, setSaveAsName] = useState(project?.name || '');
    const [projectName, setProjectName] = useState(project?.name || '');


    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const projectData = JSON.parse(event.target?.result as string);
                    if (projectData.id && projectData.userId && projectData.createdAt) {
                        loadProject(projectData);
                        toast({ title: t('builder.toasts.projectLoadedTitle'), description: t('builder.toasts.projectLoadedDesc', { projectName: projectData.name }) });
                    } else {
                        throw new Error(t('builder.errors.invalidProjectFile'));
                    }
                } catch (err) {
                    toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
                }
            };
            reader.readAsText(file);
        }
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleSave = () => {
        if (project) {
            if (!project.id) {
                if (!project.name) {
                    setIsSavePromptOpen(true);
                    return;
                }
            }
            saveProject();
        } else {
            toast({ title: t('builder.toasts.cannotSaveToastTitle'), description: t('builder.toasts.cannotSaveToastDesc'), variant: 'destructive' });
        }
    };

    const handleSaveFromPrompt = () => {
        if (project && projectName) {
            project.name = projectName;
            saveProject();
            setIsSavePromptOpen(false);
            setProjectName('');
        } else {
            toast({ title: t('projects.nameRequiredToastTitle'), description: t('projects.nameRequiredToastDesc'), variant: 'destructive' });
        }
    }

    const handleSaveAsCloud = () => {
        if (!project) return;
        const newProjectData = {
            ...project.toStateObject(),
            name: saveAsName || `Copy of ${project.name}`,
            id: '', // Unset the ID to force creation of a new document
        };
        createMutation.mutate(newProjectData, {
            onSuccess: (savedProject) => {
                toast({ title: t('projects.projectSavedAsToastTitle'), description: t('projects.projectSavedAsToastDesc', { name: savedProject.name }) });
                setIsSaveAsOpen(false);
            }
        });
    }

    const handleDownloadAs = () => {
        if (!project) return;
        const projectData = JSON.stringify(project.toStateObject(), null, 2);
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(saveAsName || project.name || 'project').replace(/\s+/g, '_')}.arkan`;
        a.click();
        URL.revokeObjectURL(url);
        setIsSaveAsOpen(false);
    }

    const handleExportReport = async (sectionsToInclude: string[]) => {
        if (!project) return;

        await exportReportDocx(project, sectionsToInclude);
    };

    return {
        t,
        fileInputRef,
        isSaveAsOpen,
        setIsSaveAsOpen,
        isSavePromptOpen,
        setIsSavePromptOpen,
        projectName,
        setProjectName,
        saveAsName,
        setSaveAsName,
        project,
        isSaving: isSaving || createMutation.isPending || updateMutation.isPending,
        handleUploadClick,
        onFileChange,
        handleSave,
        handleSaveFromPrompt,
        handleSaveAsCloud,
        handleDownloadAs,
        hasContent: !!project,
        isExporting,
        handleExportReport,
        hasUnsavedChanges: project?.hasUnsavedChanges,
        newSession,
    };
}
