
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
import { AnimatedContainer } from '@/components/ui/animation';
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
import { Cloud, Download, FileJson, Loader2, Save, Share2, Trash2, Upload } from 'lucide-react';
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
        handleUploadClick,
        onFileChange,
        handleSave,
        handleSaveFromPrompt,
        handleSaveAsCloud,
        handleDownloadAs,
        hasContent,
        t,
        // Export related items
        isExporting,
        handleExportReport,
        handleExportPresentation,
        handleExportProposal, // New handler
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

                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleUploadClick}
                                className="h-8 w-8 md:w-auto md:px-3 hover:shadow-soft transition-all duration-200 group"
                            >
                                <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="hidden md:inline ms-2">{t('builder.buttons.uploadProject')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="md:hidden">
                            <p>{t('builder.tooltips.uploadProject')}</p>
                        </TooltipContent>
                    </Tooltip>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <Button
                        variant="gradient"
                        size="icon"
                        onClick={handleSave}
                        disabled={!project?.hasUnsavedChanges || isBusy}
                        className="h-8 w-8 md:w-auto md:px-3 hover:shadow-glow transition-all duration-200 group"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="hidden md:inline ms-2">{t('projects.saveButton')}</span>
                    </Button>
                </AnimatedContainer>

                <AlertDialog open={isSavePromptOpen} onOpenChange={setIsSavePromptOpen}>
                    <AlertDialogContent className="backdrop-blur-md">
                        <AlertDialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 -m-6 p-6 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                    <Save className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <AlertDialogTitle className="font-headline">{t('projects.savePromptTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription className="mt-1">{t('projects.savePromptDescription')}</AlertDialogDescription>
                                </div>
                            </div>
                        </AlertDialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="save-project-name" className="flex items-center gap-2 font-semibold">
                                    <FileJson className="h-4 w-4 text-primary" />
                                    {t('projects.nameLabel')}
                                </Label>
                                <Input
                                    id="save-project-name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="hover:shadow-soft transition-all duration-200"
                                />
                            </div>
                        </div>
                        <AlertDialogFooter className="bg-gradient-to-r from-background to-primary/5 -m-6 p-6 rounded-b-lg">
                            <AlertDialogCancel onClick={() => setProjectName('')}>{t('projects.cancelButton')}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleSaveFromPrompt}
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                                {t('projects.saveButton')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <Dialog open={isSaveAsOpen} onOpenChange={setIsSaveAsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!hasContent}
                                className="h-8 w-8 md:w-auto md:px-3 hover:shadow-soft transition-all duration-200 group"
                            >
                                <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="hidden md:inline ms-2">{t('projects.saveAsButton')}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="backdrop-blur-md">
                            <DialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 -m-6 p-6 rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                        <Cloud className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="font-headline">{t('projects.saveAsTitle')}</DialogTitle>
                                        <DialogDescription className="mt-1">{t('projects.saveAsDescription')}</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="save-as-name" className="flex items-center gap-2 font-semibold">
                                        <FileJson className="h-4 w-4 text-primary" />
                                        {t('projects.nameLabel')}
                                    </Label>
                                    <Input
                                        id="save-as-name"
                                        defaultValue={project?.name || (project?.proposal as any)?.title}
                                        onChange={(e) => setSaveAsName(e.target.value)}
                                        className="hover:shadow-soft transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="bg-gradient-to-r from-background to-primary/5 -m-6 p-6 rounded-b-lg">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleDownloadAs}
                                    className="hover:shadow-soft transition-all duration-200"
                                >
                                    <FileJson className="me-2 h-4 w-4" />
                                    {t('projects.downloadButton')}
                                </Button>
                                <Button
                                    onClick={handleSaveAsCloud}
                                    disabled={isSaving}
                                    variant="gradient"
                                    className="hover:shadow-glow transition-all duration-200"
                                >
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                                    <Cloud className="me-2 h-4 w-4" />
                                    {t('projects.saveToCloudButton')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={500}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 md:w-auto md:px-3 hover:shadow-soft transition-all duration-200 group"
                                disabled={isBusy || !hasContent}
                            >
                                <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="hidden md:inline ms-2">Export</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 backdrop-blur-md">
                            <DropdownMenuLabel className="flex items-center gap-2">
                                <Share2 className="h-4 w-4 text-primary" />
                                Export Options
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger disabled={isBusy || !project?.proposal} className="hover:bg-primary/5">
                                    <FileJson className="h-4 w-4 mr-2" />
                                    Proposal
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="backdrop-blur-md">
                                    <DropdownMenuItem onSelect={() => handleExportProposal('docx')} className="hover:bg-primary/5">
                                        <Download className="h-4 w-4 mr-2" />
                                        as DOCX
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleExportProposal('pdf')} className="hover:bg-primary/5">
                                        <Download className="h-4 w-4 mr-2" />
                                        as PDF
                                    </DropdownMenuItem>
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
                                className="hover:bg-primary/5"
                            >
                                <div className="flex flex-col w-full">
                                    <span>Export Presentation as PPTX</span>
                                    <span className="text-xs text-muted-foreground">Requires generated presentation slides</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={600}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => project?.newSession()}
                                className="h-8 w-8 md:w-auto md:px-3 hover:shadow-glow transition-all duration-200 group"
                            >
                                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="hidden md:inline ms-2">{t('builder.buttons.newSession')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="md:hidden">
                            <p>{t('builder.tooltips.newSession')}</p>
                        </TooltipContent>
                    </Tooltip>
                </AnimatedContainer>
            </div>
        </TooltipProvider>
    );
};
