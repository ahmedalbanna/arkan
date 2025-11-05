
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, Save, FileJson, Upload, Cloud, Share2 } from 'lucide-react';
import React, { useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBuilderStore, useExport, useSaveProject, useToast } from '@/hooks';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { ReportExportDialog } from './ExportDialogs';
import { useLocalization } from '@/context/LocalizationContext';
import { useRouter } from 'next/navigation';


export const SessionActions = () => {
    const { t } = useLocalization();
    const router = useRouter();
    const { toast } = useToast();
    const {
        fileInputRef,
        isSaveAsOpen,
        setIsSaveAsOpen,
        isSavePromptOpen,
        setIsSavePromptOpen,
        saveAsName,
        setSaveAsName,
        project,
        handleUploadClick,
        onFileChange,
        handleDownloadAs,
        hasContent,
        hasUnsavedChanges,
        newSession,
    } = useBuilderStore(); 

    const { saveProject, isSaving } = useSaveProject();
    const { isExporting, exportReportDocx } = useExport();

    useEffect(() => {
        if (project?.name) {
            setSaveAsName(project.name);
        }
    }, [project?.name, setSaveAsName]);

    const handleSave = () => {
        if (!project) return;
        if (!project.userId || !project.id.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i)) { // Check if it's a temp project
            setIsSavePromptOpen(true);
        } else {
            saveProject();
        }
    };

    const handleSaveFromPrompt = () => {
        if (project && saveAsName) {
            project.name = saveAsName;
            saveProject();
            setIsSavePromptOpen(false);
            setSaveAsName('');
        } else {
            toast({ title: t('projects.nameRequiredToastTitle'), description: t('projects.nameRequiredToastDesc'), variant: 'destructive' });
        }
    };
    
    const handleExportReport = async (sectionsToInclude: string[]) => {
        if (!project) return;
        await exportReportDocx(project, sectionsToInclude);
    };

    const isBusy = isSaving || isExporting;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e, toast, t, router)}
                    accept=".arkan"
                    className="hidden"
                />

                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                            variant="outline"
                            size="icon"
                            onClick={handleUploadClick}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Upload className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">{t('builder.buttons.uploadProject')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.uploadProject')}</p>
                    </TooltipContent>
                </Tooltip>

                 <Button
                    variant="default"
                    size="icon"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isBusy}
                    className="h-8 w-8 md:w-auto md:px-3"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     <span className="hidden md:inline ms-2">{t('projects.saveButton')}</span>
                </Button>

                <AlertDialog open={isSavePromptOpen} onOpenChange={setIsSavePromptOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('projects.savePromptTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('projects.savePromptDescription')}</AlertDialogDescription>
                        </AlertDialogHeader>
                         <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="save-project-name" className="text-right">{t('projects.nameLabel')}</Label>
                                <Input id="save-project-name" value={saveAsName} onChange={(e) => setSaveAsName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSaveAsName('')}>{t('projects.cancelButton')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSaveFromPrompt} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                                {t('projects.saveButton')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={isSaveAsOpen} onOpenChange={setIsSaveAsOpen}>
                    <DialogTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            disabled={!hasContent}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Save className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">{t('projects.saveAsButton')}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('projects.saveAsTitle')}</DialogTitle>
                            <DialogDescription>{t('projects.saveAsDescription')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="save-as-name" className="text-right">{t('projects.nameLabel')}</Label>
                                <Input id="save-as-name" value={saveAsName} onChange={(e) => setSaveAsName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={handleDownloadAs}>
                                <FileJson className="me-2 h-4 w-4" />
                                {t('projects.downloadButton')}
                            </Button>
                            <Button onClick={handleSaveFromPrompt} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                                <Cloud className="me-2 h-4 w-4" />
                                {t('projects.saveToCloudButton')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 md:w-auto md:px-3" disabled={isBusy || !hasContent}>
                            <Share2 className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">Export</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                         <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                        <ReportExportDialog
                            isExporting={isExporting}
                            onExport={handleExportReport}
                            disabled={isBusy || !project?.sections || project.sections.length === 0}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>

                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => newSession()}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Trash2 className="h-4 w-4" />
                             <span className="hidden md:inline ms-2">{t('builder.buttons.newSession')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.newSession')}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
