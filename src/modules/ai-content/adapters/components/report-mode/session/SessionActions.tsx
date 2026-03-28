
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
            <div className="flex items-center gap-2 p-1.5 bg-background/40 border border-primary/10 rounded-2xl backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] group/actions transition-all duration-500 hover:border-primary/20">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept=".arkan"
                    className="hidden"
                />

                <div className="flex items-center gap-1.5 px-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => newSession()}
                                className="h-8 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">New</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Initialize Fresh Manifest</TooltipContent>
                    </Tooltip>

                    <BrowseProjectsDialog />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleUploadClick}
                                className="h-8 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Import</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Ingest .arkan Object</TooltipContent>
                    </Tooltip>
                </div>

                <div className="h-4 w-px bg-primary/10 mx-1 opacity-40" />

                <div className="flex items-center gap-1.5 px-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={hasUnsavedChanges ? "default" : "ghost"}
                                size="sm"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges || isSaving}
                                className={cn(
                                    "h-8 px-4 gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-xl",
                                    hasUnsavedChanges && !isSaving 
                                        ? "shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary hover:scale-[1.02] ring-1 ring-white/20" 
                                        : "hover:bg-primary/10 hover:text-primary grayscale-[0.5] opacity-60 hover:grayscale-0 hover:opacity-100"
                                )}
                            >
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                                    <div className="relative">
                                        <Save className="h-3.5 w-3.5" />
                                        {hasUnsavedChanges && !isSaving && (
                                            <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                                        )}
                                    </div>
                                )}
                                <span className="hidden xl:inline">{t('projects.saveButton')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Commit State to Storage</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                disabled={!hasContent}
                                className="h-8 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Snapshot</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Export Technical JSON</TooltipContent>
                    </Tooltip>

                    <ExportDialog />
                </div>
            </div>
        </TooltipProvider>
    );
}
