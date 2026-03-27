
'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useProjectFileOperations } from '@/modules/projects/adapters/hooks/useProjectFileOperations';
import { useSaveProject } from '@/modules/projects/adapters/hooks/use-projects';
import { Download, Loader2, PlusCircle, Save, Upload } from 'lucide-react';
import { useRef } from 'react';
import { BrowseProjectsDialog } from './BrowseProjectsDialog';
import { ExportDialog } from './ExportDialog';
import { cn } from '@/infrastructure/utils/cn';

interface SessionActionsProps {
    isSaving: boolean;
}

export function SessionActions({ isSaving }: SessionActionsProps) {
    const { t } = useLocalization();
    const { project, hasUnsavedChanges, newSession } = useBuilderStore();
    const { saveProjectMutation } = useSaveProject();
    const { handleUploadProject, handleDownloadProject } = useProjectFileOperations();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await handleUploadProject(file);
            } catch (error) {
                // Error already handled in the hook
            }
        }
        if (e.target) e.target.value = '';
    };

    const handleSave = () => {
        if (!project) return;
        saveProjectMutation.mutate(project.toStateObject());
    };

    const handleDownload = () => {
        if (project) {
            handleDownloadProject(project);
        }
    };

    const hasContent = project?.hasContent() ?? false;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1.5 p-1 bg-muted/20 border rounded-xl backdrop-blur-sm shadow-sm">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept=".arkan"
                    className="hidden"
                />

                <div className="flex items-center gap-1 px-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => newSession()}
                                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">New</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">Start Fresh Project</TooltipContent>
                    </Tooltip>

                    <BrowseProjectsDialog />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleUploadClick}
                                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Import</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">{t('builder.tooltips.uploadProject')}</TooltipContent>
                    </Tooltip>
                </div>

                <div className="h-4 w-px bg-border/60 mx-1" />

                <div className="flex items-center gap-1 px-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={hasUnsavedChanges ? "default" : "ghost"}
                                size="sm"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges || isSaving}
                                className={cn(
                                    "h-8 gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                                    hasUnsavedChanges && !isSaving ? "shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                <span className="hidden xl:inline">{t('projects.saveButton')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">Commit Changes to Cloud</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                disabled={!hasContent}
                                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Snapshot</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">Download Offline Copy</TooltipContent>
                    </Tooltip>

                    <ExportDialog />
                </div>
            </div>
        </TooltipProvider>
    );
}
