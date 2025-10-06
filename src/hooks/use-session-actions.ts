
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject, useToast, useUpdateProject } from '@/hooks';
import { Project } from '@/lib/models/project';
import type { SavedProject } from '@/lib/types';
import { saveAs } from 'file-saver';
import React, { useRef, useState } from 'react';
import { useExportEnhanced } from './use-export-enhanced';


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

    // Subscribe to the project and hasUnsavedChanges states directly
    const project = useBuilderStore(state => state.project);
    const hasUnsavedChanges = useBuilderStore(state => state.hasUnsavedChanges);
    const { loadProject, newSession, updateProject } = useBuilderStore();

    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();

    // --- Start of Export Logic Integration (Enhanced) ---
    const {
        exportProposal,
        exportReport,
        exportPresentation,
        exportAcademicSolution,
        isExporting,
        isProposalExporting,
        isReportExporting,
        isPresentationExporting,
        isAcademicExporting
    } = useExportEnhanced();

    const handleExportProposal = async (format: 'docx' | 'pdf' | 'html') => {
        if (project && project.proposal) {
            // إنشاء مقترح مع الحقول المطلوبة
            const proposalData = {
                title: (project.proposal as any)?.title || project.name || 'Untitled Proposal',
                category: (project.proposal as any)?.category || 'General',
                ...project.proposal
            };

            const result = await exportProposal(proposalData, format, {
                includeImages: true,
                templateId: 'modern-proposal-template',
                customStyles: {
                    title: { fontSize: 24, fontWeight: 'bold' },
                    body: { fontSize: 12, lineHeight: 1.5 }
                }
            });

            if (result.success) {
                toast({
                    title: t('export.success') || 'Export Successful',
                    description: `${format.toUpperCase()} file exported successfully`,
                });
            }
        }
    }

    const handleExportReport = async (sectionsToInclude: string[]) => {
        if (!project || !hasAnyContent(project)) return;

        const reportData = {
            sections: project.sections || {},
            diagrams: project.diagrams || {},
            title: project.name || 'Untitled Report',
            translatedTitles: {},
            sectionsToInclude
        };

        const result = await exportReport(reportData, 'docx', {
            includeImages: true,
            includeDiagrams: true,
            templateId: 'professional-report-template',
            customStyles: {
                title: { fontSize: 20, fontWeight: 'bold' },
                body: { fontSize: 12, lineHeight: 1.4 }
            }
        });

        if (result.success) {
            toast({
                title: t('export.success') || 'Export Successful',
                description: 'Report exported successfully',
            });
        }
    };

    const handleExportPresentation = async () => {
        if (!project || !project.presentation?.history.length) return;
        const latestPresentation = project.presentation.history[0];

        const result = await exportPresentation(
            latestPresentation.slides || [],
            latestPresentation.name || 'Untitled Presentation',
            'pptx',
            {
                includeImages: true,
                templateId: 'corporate-presentation-template',
                customStyles: {
                    titleSlide: { backgroundColor: '#f7fafc' },
                    contentSlide: { backgroundColor: '#ffffff' }
                }
            }
        );

        if (result.success) {
            toast({
                title: t('export.success') || 'Export Successful',
                description: 'Presentation exported successfully',
            });
        }
    }

    const handleExportAcademicSolution = async () => {
        if (!project || !project.academicSolver?.analyzedDocument || !project.academicSolver?.solvedDocument) return;

        const result = await exportAcademicSolution(
            project.academicSolver.analyzedDocument,
            project.academicSolver.solvedDocument,
            'docx',
            {
                includeImages: true,
                templateId: 'academic-solution-template',
                customStyles: {
                    title: { fontSize: 22, fontWeight: 'bold' },
                    body: { fontSize: 12, lineHeight: 1.6 }
                }
            }
        );

        if (result.success) {
            toast({
                title: t('export.success') || 'Export Successful',
                description: 'Academic solution exported successfully',
            });
        }
    }
    // --- End of Export Logic Integration (Enhanced) ---

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

        if (projectToSave.id && !projectToSave.id.startsWith('temp-')) {
            updateProjectMutation.mutate({ projectId: projectToSave.id, data: projectData });
        } else {
            // إنشاء بيانات الحفظ مع الحقول المطلوبة
            const saveData = {
                name: finalName,
                type: 'proposal' as const, // نوع افتراضي
                language: 'ar' as const, // لغة افتراضية
                description: projectToSave.projectIdea || '',
                teamId: projectToSave.teamId ?? undefined
            };
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
        const finalSaveAsName = saveAsName.trim() || project.name || (project.proposal as any)?.title || 'Untitled Project';

        // إنشاء بيانات الحفظ مع الحقول المطلوبة
        const saveData = {
            name: String(finalSaveAsName),
            type: 'proposal' as const, // نوع افتراضي
            language: 'ar' as const, // لغة افتراضية
            description: project.projectIdea || '',
            teamId: project.teamId ?? undefined
        };

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
        hasUnsavedChanges, // Expose the reactive state
    };
}
