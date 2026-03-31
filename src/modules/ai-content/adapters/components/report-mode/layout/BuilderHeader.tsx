'use client';

import React, { useRef } from 'react';
import { BookOpenText, Settings, ZoomIn, ZoomOut, Save, RotateCcw, PlusCircle, Upload, Download, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useProjectFileOperations } from '@/modules/projects/adapters/hooks/useProjectFileOperations';
import { BrowseProjectsDialog } from '../session/BrowseProjectsDialog';
import { ExportDialog } from '../session/ExportDialog';

interface BuilderHeaderProps {
    projectName: string;
    onProjectNameChange: (name: string) => void;
    onProjectNameBlur: () => void;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    onSave: () => void;
}

export const BuilderHeader = React.forwardRef<HTMLDivElement, BuilderHeaderProps>(({
    projectName,
    onProjectNameChange,
    onProjectNameBlur,
    isSaving,
    hasUnsavedChanges,
    onSave
}, ref) => {
    const { t } = useLocalization();
    const { project, newSession } = useBuilderStore();
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

    const handleDownload = () => {
        if (project) {
            handleDownloadProject(project);
        }
    };

    const hasContent = project?.hasContent() ?? false;
    return (
        <header
            ref={ref}
            className="h-16 border-b border-border/40 bg-background/40 backdrop-blur-2xl shrink-0 z-50 px-8 flex items-center justify-between transition-all duration-700 ease-in-out group/header relative"
        >
            {/* Animated Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="flex items-center gap-6 relative z-10">
                <div className="relative group/logo">
                    <div className="absolute -inset-1.5 bg-primary/20 rounded-xl blur opacity-0 group-hover/logo:opacity-100 transition duration-500" />
                    <div className="relative h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 border border-primary/20">
                        <BookOpenText className="h-5 w-5 text-primary-foreground" />
                    </div>
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="relative group/input">
                            <Input
                                className="text-lg font-black tracking-tighter text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent truncate max-w-[200px] lg:max-w-[400px] transition-all duration-300"
                                value={projectName}
                                onChange={(e) => onProjectNameChange(e.target.value)}
                                onBlur={onProjectNameBlur}
                            />
                            <div className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-primary group-hover/input:w-full transition-all duration-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                        <span>Project Intel</span>
                        <span className="h-1 w-1 rounded-full bg-primary/40" />
                        <span>Manifest v1.2.4</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <div className="flex items-center gap-1.5 p-1.5 bg-background/40 border border-primary/10 rounded-2xl backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] group/actions transition-all duration-500 hover:border-primary/20">
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
                                            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
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
                                            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            <span className="hidden xl:inline">Import</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Ingest .arkan Object</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="h-4 w-px bg-primary/10 mx-0.5 opacity-40" />

                            <div className="flex items-center gap-1 px-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={hasUnsavedChanges ? "default" : "ghost"}
                                            size="sm"
                                            onClick={onSave}
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
                                            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span className="hidden xl:inline">Source</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Export Technical JSON</TooltipContent>
                                </Tooltip>

                                <ExportDialog />
                            </div>
                        </div>
                    </TooltipProvider>


                </div>
            </div>
        </header>
    );
});

BuilderHeader.displayName = 'BuilderHeader';
