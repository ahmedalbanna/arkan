
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject, useToast, useUpdateProject, useExport } from '@/hooks';
import { Project } from '@/lib/models/project';
import type { SavedProject } from '@/lib/types';
import { saveAs } from 'file-saver';
import { useRef, useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Save, FileJson, Upload, Cloud, Share2 } from 'lucide-react';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { ReportExportDialog } from '../project/ExportDialogs';


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

    const { project, loadProject, newSession, updateProject, setHasUnsavedChanges } = useBuilderStore();
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();

    // --- Start of Export Logic Integration ---
    const { exportProposal, exportReportDocx, exportPresentationPptx, isExporting } = useExport();

    const handleExportProposal = async (format: 'docx' | 'pdf') => {
        if (project && project.proposal) {
            await exportProposal(format, project);
        }
    }

    const handleExportReport = async (sectionsToInclude: string[]) => {
        if (!project || !hasAnyContent(project)) return;
         await exportReportDocx(project, {}, sectionsToInclude);
    };

    const handleExportPresentation = async () => {
        if (!project || !project.presentation?.history.length) return;
        const latestPresentation = project.presentation.history[0];
        await exportPresentationPptx(project, latestPresentation.id);
    }
    // --- End of Export Logic Integration ---

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
                // Here, you would ideally validate the parsedState against a Zod schema
                // before loading it into the store to ensure data integrity.
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

        // It's crucial to get the latest state right before mutation
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
        const finalSaveAsName = saveAsName.trim() || project.name || (project.proposal as any)?.title || 'Untitled Project';

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
        t,
        // New exports for export functionality
        isExporting,
        handleExportProposal,
        handleExportReport,
        handleExportPresentation,
    };
}
