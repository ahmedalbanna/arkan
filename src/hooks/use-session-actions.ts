'use client';

import { useRef, useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks';
import { useSaveProject, useUpdateProject } from '@/hooks';
import { useReportStore } from '@/hooks';
import { useDiagramStore } from '@/hooks';
import { usePresentationStore } from '@/hooks';
import { useCodeGeneratorStore } from '@/hooks';
import { useProjectPlanStore } from '@/hooks';
import { useCodebaseStore } from '@/hooks';
import { useAcademicSolverStore } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

function hasAnyContent(): boolean {
    if (useBuilderStore.getState().projectIdea?.trim()) return true;
    if (useBuilderStore.getState().proposal) return true;
    if (Object.values(useReportStore.getState().sections).some(s => !!s)) return true;
    if (Object.values(useDiagramStore.getState().diagrams).some(d => !!d)) return true;
    if (usePresentationStore.getState().presentation?.history && usePresentationStore.getState().presentation!.history.length > 0) return true;
    if (useCodeGeneratorStore.getState().html) return true;
    if (useProjectPlanStore.getState().projectPlan) return true;
    if (useCodebaseStore.getState().codebase) return true;
    if (useAcademicSolverStore.getState().analyzedDocument) return true;
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

    const store = useBuilderStore();
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();

    const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;

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
                const decodedJson = decodeURIComponent(escape(atob(content)));
                const parsedState = JSON.parse(decodedJson);
                store.loadState(parsedState);
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveProjectFile = (name?: string) => {
        if (!hasAnyContent()) return;
        const finalName = name?.trim() || store.name || store.proposal?.title || 'arkan_project';
        const jsonString = JSON.stringify(store.getFullState());
        const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
        const blob = new Blob([encodedData], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${finalName}.arkan`);
    }

    const performSave = (name?: string) => {
        if (!hasAnyContent()) {
            toast({ title: t("projects.cannotSaveToastTitle"), description: t("projects.cannotSaveToastDesc"), variant: 'destructive' });
            return;
        }

        const projectData = store.getFullState();
        const finalName = String(name || store.name || store.proposal?.title || '' || 'Untitled Project');
        const saveData = { ...projectData, name: finalName };

        if (store.currentProjectId) {
            updateProjectMutation.mutate({ projectId: store.currentProjectId, data: saveData });
        } else {
            saveProjectMutation.mutate(saveData);
        }
    }

    const handleSave = () => {
        if (store.currentProjectId || store.name) {
            performSave();
        } else if (hasAnyContent()) {
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
        const projectData = store.getFullState();
        const finalSaveAsName = saveAsName.trim() || store.name || store.proposal?.title || 'Untitled Project';
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
         const finalSaveAsName = saveAsName.trim() || store.name || store.proposal?.title || 'Untitled Project';
         handleSaveProjectFile(finalSaveAsName as string);
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
        store,
        isSaving,
        handleUploadClick,
        onFileChange,
        handleSave,
        handleSaveFromPrompt,
        handleSaveAsCloud,
        handleDownloadAs,
        hasContent: hasAnyContent(),
        t
    };
}
