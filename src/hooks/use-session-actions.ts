
'use client';

import { useRef, useState } from 'react';
import { useBuilderStore, useSaveProject, useUpdateProject, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { saveAs } from 'file-saver';
import type { ProjectState, SavedProject } from '@/lib/types';
import { Project } from '@/lib/models/project';

function hasAnyContent(project: Project | null): boolean {
    if (!project) return false;
    if (project.projectIdea?.trim()) return true;
    if (project.proposal) return true;
    if (Object.values(project.sections || {}).some(s => !!s)) return true;
    if (Object.values(project.diagrams || {}).some(d => !!d)) return true;
    if (project.presentation?.history && project.presentation.history.length > 0) return true;
    if (project.codeGenerator?.html) return true;
    if (project.projectPlan) return true;
    if (project.codebase) return true;
    if (project.academicSolver?.analyzedDocument) return true;
    return false;
}

export function useSessionActions() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { t } = useLocalization();
    const [saveAsName, setSaveAsName] = useState('');
    const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [projectName, setProjectName] = useState('');

    const { project, loadProject, setProject } = useBuilderStore();
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();

    const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;

    const handleUploadClick = () => {
        setProject(null); // Clear session before loading
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const decodedJson = decodeURIComponent(escape(atob(content)));
                const parsedState = JSON.parse(decodedJson);
                loadProject(parsedState as SavedProject);
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveProjectFile = (name?: string) => {
        if (!project || !hasAnyContent(project)) return;
        const finalName = name?.trim() || project.name || (project.proposal as any)?.title || 'arkan_project';
        const jsonString = JSON.stringify(project.toStateObject());
        const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
        const blob = new Blob([encodedData], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${finalName}.arkan`);
    }

    const performSave = (name?: string) => {
        if (!project || !hasAnyContent(project)) {
            toast({ title: t("projects.cannotSaveToastTitle"), description: t("projects.cannotSaveToastDesc"), variant: 'destructive' });
            return;
        }

        const projectData = project.toStateObject();
        const finalName = name || project.name || (project.proposal as any)?.title || 'Untitled Project';
        const saveData = { ...projectData, name: finalName };

        if (project.id && !project.id.startsWith('temp-')) {
            updateProjectMutation.mutate({ projectId: project.id, data: saveData });
        } else {
            saveProjectMutation.mutate(saveData);
        }
    }

    const handleSave = () => {
        if (!project) return;
        // If the project has a real ID, save it directly.
        if (project.id && !project.id.startsWith('temp-')) {
            performSave();
        } else if (hasAnyContent(project)) {
            // If it's a new project with content, prompt for a name.
            setIsSavePromptOpen(true);
        } else {
            // If it's a new, empty project, don't allow saving.
            toast({ title: t("projects.cannotSaveToastTitle"), description: t("projects.cannotSaveToastDesc"), variant: 'destructive' });
        }
    }

    const handleSaveFromPrompt = () => {
        if (projectName.trim()) {
            performSave(projectName);
            setIsSavePromptOpen(false);
            setProjectName('');
        } else {
            toast({ title: t("projects.nameRequiredToastTitle"), description: t("projects.nameRequiredToastDesc"), variant: "destructive" });
        }
    };

    const handleSaveAsCloud = () => {
        if (!project) return;
        const projectData = project.toStateObject();
        const finalSaveAsName = saveAsName.trim() || project.name || (project.proposal as any)?.title || 'Untitled Project';
        const saveData = { ...projectData, name: String(finalSaveAsName) };
        saveProjectMutation.mutate(saveData, {
            onSuccess: (newProject) => {
                 toast({
                    title: t("projects.projectSavedAsToastTitle"),
                    description: t("projects.projectSavedAsToastDesc").replace('{name}', newProject.name),
                });
                setIsSaveAsOpen(false);
                setSaveAsName('');
            }
        });
    }

    const handleDownloadAs = () => {
         const finalSaveAsName = saveAsName.trim() || project?.name || (project?.proposal as any)?.title || 'Untitled Project';
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
        handleUploadClick,
        onFileChange,
        handleSave,
        handleSaveFromPrompt,
        handleSaveAsCloud,
        handleDownloadAs,
        hasContent: hasAnyContent(project),
        t
    };
}
