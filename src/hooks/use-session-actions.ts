
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject, useToast, useUpdateProject, useExport } from '@/hooks';
import { Project, type ProjectProperties, type SavedProject } from '@/lib/models/project';
import { useAuth } from '@/context/AuthContext';
import { saveAs } from 'file-saver';
import { useRef, useState } from 'react';

function hasAnyContent(project: Project | null): boolean {
    if (!project) return false;
    if (project.projectIdea?.trim()) return true;
    if (Object.values(project.sections || {}).some(s => !!s)) return true;
    if (Object.values(project.diagrams || {}).some(d => !!d)) return true;
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

    const project = useBuilderStore(state => state.project);
    const hasUnsavedChanges = useBuilderStore(state => state.hasUnsavedChanges);
    const { loadProject, newSession, updateProject } = useBuilderStore();
    
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();

    const { exportReportDocx, isExporting } = useExport();
    const { firebaseUser } = useAuth();

    const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;

    const handleUploadClick = () => {
        newSession();
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
        const finalName = name?.trim() || project.name || 'arkan_project';
        const jsonString = JSON.stringify(project.toJSON());
        const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
        const blob = new Blob([encodedData], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${finalName}.arkan`);
    }

    const performSave = (name?: string) => {
        if (!project || !hasAnyContent(project)) {
            toast({ title: t("projects.cannotSaveToastTitle"), description: t("projects.cannotSaveToastDesc"), variant: 'destructive' });
            return;
        }

        if (name) {
            updateProject(p => { p.name = name; });
        }

        const projectToSave = useBuilderStore.getState().project!;
        const projectData = projectToSave.toStateObject();
        const finalName = projectToSave.name || 'Untitled Project';
        const saveData = { ...projectData, name: finalName };


        if (projectToSave.id && !projectToSave.id.startsWith('temp-')) {
            updateProjectMutation.mutate({ projectId: projectToSave.id, data: saveData });
        } else {
            saveProjectMutation.mutate(saveData);
        }
    }

    const handleSave = () => {
        if (!project) return;

        if (project.id && !project.id.startsWith('temp-')) {
            performSave();
        } else if (hasAnyContent(project)) {
            setProjectName(project.name || '');
            setIsSavePromptOpen(true);
        } else {
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
        const projectData = project.toJSON();
        const finalSaveAsName = saveAsName.trim() || project.name || 'Untitled Project';

        const saveData = { ...projectData, name: String(finalSaveAsName), id: '' };

        saveProjectMutation.mutate(saveData, {
            onSuccess: (newProjectData) => {
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

    const handleExportReport = async (sectionsToInclude: string[]) => {
        if (!project || !hasAnyContent(project)) return;
         await exportReportDocx(project, {}, sectionsToInclude);
    };

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
        t,
        isExporting,
        handleExportReport,
        hasUnsavedChanges,
    };
}
