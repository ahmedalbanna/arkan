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

            <div className="flex items-center gap-5 relative z-10">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[inset_0_0_12px_rgba(var(--primary),0.1)] group/logo overflow-hidden relative transition-all duration-500 hover:border-primary/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                    <BookOpenText className="h-5 w-5 text-primary relative z-10 transition-transform duration-500 group-hover/logo:scale-110" />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="relative group/input">
                            <Input
                                className="h-7 px-1 py-0 text-[13px] font-black uppercase tracking-[0.05em] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[240px] text-foreground/90 truncate transition-all duration-300"
                                value={projectName}
                                onChange={(e) => onProjectNameChange(e.target.value)}
                                onBlur={onProjectNameBlur}
                                placeholder="Untitled Intelligence Manifest"
                            />
                            <div className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-primary group-hover/input:w-full transition-all duration-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] py-0 h-4 border-primary/20 bg-primary/5 text-primary px-2">
                            Stable v2.4
                        </Badge>
                        <div className="flex items-center gap-1.5 opacity-50">
                            <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Active Core</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="flex items-center gap-2">
                    <TooltipProvider delayDuration={200}>
                        <div className="flex items-center gap-2 bg-background/40 backdrop-blur-xl p-1.5 rounded-2xl border border-primary/10 shadow-2xl shadow-primary/5 group/actions transition-all duration-500 hover:border-primary/20">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChange}
                                accept=".arkan"
                                className="hidden"
                            />

                            {/* Session Group */}
                            <div className="flex items-center gap-1 px-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => newSession()}
                                            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
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
                                            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            <span className="hidden xl:inline">Import</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Ingest .arkan Object</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="h-4 w-px bg-primary/10 mx-1 opacity-40" />

                            {/* Persistence Group */}
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
                                                    ? "shadow-[0_0_30px_rgba(var(--primary),0.4)] bg-primary hover:bg-primary hover:scale-[1.05] ring-2 ring-white/20"
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
                                            <span className="hidden xl:inline">Sync Manifest</span>
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
                                            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span className="hidden xl:inline">Source</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20">Export Technical JSON</TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="h-4 w-px bg-primary/10 mx-1 opacity-40" />

                            <ExportDialog />
                        </div>
                    </TooltipProvider>


                </div>
            </div>
        </header>
    );
});

BuilderHeader.displayName = 'BuilderHeader';
