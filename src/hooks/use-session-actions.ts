
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useExport, useSaveProject, useUpdateProject } from '@/hooks';
import { Project } from '@/lib/models/project';
import { saveAs } from 'file-saver';
import React, { useRef, useState } from 'react';
import { useToast } from './use-toast';

import type { SavedProject } from '@/lib/types';


export function useSessionActions() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { t } = useLocalization();
    const [saveAsName, setSaveAsName] = useState('');
    const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [projectName, setProjectName] = useState('');

    const { project, loadProject, newSession, setHasUnsavedChanges } = useBuilderStore();
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();

    const { exportProposal, exportReportDocx, exportPresentationPptx, isExporting } = useExport();

    const handleExportProposal = async (format: 'docx' | 'pdf') => {
        if (project && project.proposal) {
            await exportProposal(format, project);
        }
    }

    const handleExportReport = async (sectionsToInclude: string[]) => {
        if (!project || !project.hasAnyContent()) return;
        await exportReportDocx(project, {}, sectionsToInclude);
    };

    const handleExportPresentation = async () => {
        if (!project || !project.presentation?.history.length) return;
        const latestPresentation = project.presentation.history[0];
        await exportPresentationPptx(project, latestPresentation.id);
    }

    const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;

    const handleNewSession = () => {
        // This directly creates a new project in the database and loads it on success.
        saveProjectMutation.mutate({ name: 'Untitled Project' }, {
            onSuccess: (savedProject) => {
                loadProject(savedProject);
                toast({
                    title: "New Project Created",
                    description: "You can start working on your new project.",
                });
            },
            onError: (error) => {
                toast({
                    title: "Error Creating Project",
                    description: error.message || "Could not create a new project in the database.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const projectInstance = Project.fromArkanFile(content);
                // Here you might want to save this project to the DB or just load it locally
                // For now, let's just load it into the store
                loadProject(projectInstance.toJSON() as SavedProject);
                toast({ title: t('builder.toasts.loadSuccessTitle'), description: t('builder.toasts.loadSuccessDesc') });
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        // Reset file input to allow re-uploading the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveProjectFile = (name?: string) => {
        if (!project || !project.hasAnyContent()) return;
        if (name) {
            project.name = name.trim();
        }
        const { fileName, blob } = project.toArkanFileBlob();
        saveAs(blob, fileName);
    }

    const performSave = () => {
        if (!project?.id) {
            toast({ title: "Cannot Save", description: "Project has no valid ID.", variant: 'destructive' });
            return;
        }

        const projectData = project.toJSON();

        updateProjectMutation.mutate({ 
            projectId: project.id,
            data: projectData 
        }, {
            onSuccess: () => {
                setHasUnsavedChanges(false);
                toast({
                    title: t('projects.projectSaved'),
                    description: t('projects.projectSavedDesc', { name: project.name })
                });
            }
        });
    }

    const handleSaveFromPrompt = () => {
        if (projectName.trim() && project) {
            project.name = projectName.trim();
            performSave();
            setIsSavePromptOpen(false);
            setProjectName('');
        } else {
            toast({ title: t("projects.nameRequiredToastTitle"), description: t("projects.nameRequiredToastDesc"), variant: "destructive" });
        }
    };

    const handleSaveAsCloud = () => {
        if (!project) return;

        const newName = saveAsName.trim() || project.name || 'Untitled Project';
        const projectData = { ...project.toJSON(), name: newName, id: undefined }; // Create as a new project

        saveProjectMutation.mutate(projectData, {
            onSuccess: (newProjectData) => {
                loadProject(newProjectData); // Load the newly created project
                toast({
                    title: t("projects.projectSavedAsToastTitle"),
                    description: t("projects.projectSavedAsToastDesc", { name: newProjectData.name }),
                });
                setIsSaveAsOpen(false);
                setSaveAsName('');
            }
        });
    }

    const handleDownloadAs = () => {
        const finalSaveAsName = saveAsName.trim() || project?.name || 'Untitled Project';
        handleSaveProjectFile(finalSaveAsName);
        setIsSaveAsOpen(false);
        setSaveAsName('');
    }

    return {
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
        isSaving,
        handleNewSession,
        handleUploadClick,
        onFileChange,
        handleSave: performSave,
        handleSaveFromPrompt,
        handleSaveAsCloud,
        handleDownloadAs,
        hasContent: project?.hasAnyContent(),
        t,
        isExporting,
        handleExportProposal,
        handleExportReport,
        handleExportPresentation,
    };
}
