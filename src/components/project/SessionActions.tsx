
'use client';

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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSessionActions } from '@/hooks';
import { Cloud, Download, FileJson, Loader2, Save, Trash2, Upload } from 'lucide-react';
import { ReportExportDialog } from './ExportDialogs';

export const SessionActions = () => {
    const {
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
        handleSave,
        handleSaveFromPrompt,
        handleSaveAsCloud,
        handleDownloadAs,
        hasContent,
        t,
        isExporting,
        handleExportReport,
        handleExportPresentation,
        handleExportProposal,
    } = useSessionActions();

    const isBusy = isSaving || isExporting;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
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
                    disabled={!project?.hasUnsavedChanges || isBusy}
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
                                <Input id="save-project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setProjectName('')}>{t('projects.cancelButton')}</AlertDialogCancel>
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
                                <Input id="save-as-name" defaultValue={project?.name || (project?.proposal as any)?.title} onChange={(e) => setSaveAsName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={handleDownloadAs}>
                                <FileJson className="me-2 h-4 w-4" />
                                {t('projects.downloadButton')}
                            </Button>
                            <Button onClick={handleSaveAsCloud} disabled={isSaving}>
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
                            <Download className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">Export</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger disabled={isBusy || !project?.proposal}>Proposal</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onSelect={() => handleExportProposal('docx')}>as DOCX</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleExportProposal('pdf')}>as PDF</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <ReportExportDialog
                            isExporting={isExporting}
                            onExport={handleExportReport}
                            disabled={isBusy || !project?.sections || Object.keys(project.sections).length === 0}
                        />
                        <DropdownMenuItem
                            onSelect={() => handleExportPresentation()}
                            disabled={isBusy || !project?.presentation?.history.length}
                        >
                            <div className="flex flex-col w-full">
                                <span>Export Presentation as PPTX</span>
                                <span className="text-xs text-muted-foreground">Requires generated presentation slides</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleNewSession}
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
