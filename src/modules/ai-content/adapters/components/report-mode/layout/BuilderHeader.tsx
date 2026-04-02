'use client';

import React, { useRef } from 'react';
import { BookOpenText, PlusCircle, Upload, Download, Loader2, Save } from 'lucide-react';
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
    onSave,
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
            className="h-14 border-b border-border/40 bg-background/50 backdrop-blur-2xl shrink-0 z-50 px-6 flex items-center justify-between transition-all duration-700 ease-in-out relative"
        >
            {/* Dot-grid atmosphere — aligned with BuilderCanvas (28px, 1.5px center) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Left — brand + project identity */}
            <div className="flex items-center gap-4 relative z-10 min-w-0">
                {/* Logo HUD */}
                <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[inset_0_0_12px_rgba(var(--primary),0.1)] group/logo overflow-hidden relative transition-all duration-500 hover:border-primary/30 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                    <BookOpenText className="h-4.5 w-4.5 text-primary relative z-10 transition-transform duration-500 group-hover/logo:scale-110" />
                </div>

                {/* Project name + metadata */}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="relative group/input">
                        <Input
                            className="h-7 px-1 py-0 text-[13px] font-black uppercase tracking-[0.05em] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[200px] max-w-[320px] text-foreground/90 truncate transition-all duration-300"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                            onBlur={onProjectNameBlur}
                            placeholder="Untitled Project"
                        />
                        {/* Animated underline on hover/focus */}
                        <div className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-primary/60 group-hover/input:w-full transition-all duration-500" />
                    </div>

                    <div className="flex items-center gap-2.5 px-1">
                        <Badge
                            variant="outline"
                            className="text-[8px] font-black uppercase tracking-[0.22em] py-0 h-3.5 border-primary/20 bg-primary/5 text-primary/70 px-1.5"
                        >
                            v2.4
                        </Badge>
                        <div className="flex items-center gap-1 opacity-40">
                            <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — session actions */}
            <div className="flex items-center gap-3 relative z-10 shrink-0">
                <TooltipProvider delayDuration={200}>
                    {/* Action pill */}
                    <div className="flex items-center gap-1 bg-background/40 backdrop-blur-xl p-1 rounded-xl border border-border/30 shadow-sm transition-all duration-500 hover:border-primary/15">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileChange}
                            accept=".arkan"
                            className="hidden"
                        />

                        {/* File ops group */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => newSession()}
                                    className="h-7 w-7 xl:w-auto xl:px-2.5 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg text-muted-foreground"
                                >
                                    <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span className="hidden xl:inline">New</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-2">
                                New Project
                            </TooltipContent>
                        </Tooltip>

                        <BrowseProjectsDialog />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUploadClick}
                                    className="h-7 w-7 xl:w-auto xl:px-2.5 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg text-muted-foreground"
                                >
                                    <Upload className="h-3.5 w-3.5 shrink-0" />
                                    <span className="hidden xl:inline">Import</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-2">
                                Import .arkan File
                            </TooltipContent>
                        </Tooltip>

                        {/* Divider */}
                        <div className="h-4 w-px bg-border/50 mx-0.5" aria-hidden />

                        {/* Persistence group */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={hasUnsavedChanges ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={onSave}
                                    disabled={!hasUnsavedChanges || isSaving}
                                    className={cn(
                                        "h-7 px-3 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition-all duration-500 rounded-lg",
                                        hasUnsavedChanges && !isSaving
                                            ? "shadow-[0_0_20px_rgba(var(--primary),0.35)] bg-primary hover:bg-primary hover:scale-[1.03] ring-1 ring-white/10"
                                            : "hover:bg-primary/10 hover:text-primary opacity-50 hover:opacity-100 text-muted-foreground"
                                    )}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                                    ) : (
                                        <div className="relative shrink-0">
                                            <Save className="h-3.5 w-3.5" />
                                            {hasUnsavedChanges && !isSaving && (
                                                <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                                            )}
                                        </div>
                                    )}
                                    <span className="hidden xl:inline">Save</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-2">
                                Save Project
                                <span className="opacity-50 ml-1.5 font-normal normal-case tracking-normal">Ctrl S</span>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDownload}
                                    disabled={!hasContent}
                                    className="h-7 w-7 xl:w-auto xl:px-2.5 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg text-muted-foreground disabled:opacity-30"
                                >
                                    <Download className="h-3.5 w-3.5 shrink-0" />
                                    <span className="hidden xl:inline">Download</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-2">
                                Download as .arkan
                            </TooltipContent>
                        </Tooltip>

                        {/* Divider */}
                        <div className="h-4 w-px bg-border/50 mx-0.5" aria-hidden />

                        <ExportDialog />
                    </div>
                </TooltipProvider>
            </div>
        </header>
    );
});

BuilderHeader.displayName = 'BuilderHeader';
