'use client';

import { AtmosphericGrid } from '@/components/shared/AtmosphericGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { useProjectFileOperations } from '@/modules/projects/adapters/hooks/useProjectFileOperations';
import { Download, Loader2, PlusCircle, Save, Upload } from 'lucide-react';
import React, { useRef } from 'react';
import { ExportHUD } from '../session/ExportHUD';
import { LibraryHUD } from '../session/LibraryHUD';

interface BuilderHeaderProps {
    projectName: string;
    onProjectNameChange: (name: string) => void;
    onProjectNameBlur: () => void;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    onSave: () => void;
    className?: string;
}

export const BuilderHeader = React.forwardRef<HTMLDivElement, BuilderHeaderProps>(({
    projectName,
    onProjectNameChange,
    onProjectNameBlur,
    isSaving,
    hasUnsavedChanges,
    onSave,
    className,
}, ref) => {
    const { t } = useLocalization();
    const { project, newSession } = useBuilderStore();
    const { handleUploadProject, handleDownloadProject } = useProjectFileOperations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            className={cn(
                "h-16 flex items-center justify-between gap-8 px-6 bg-background border-b border-primary/10 transition-all duration-700 ease-[0.22,1,0.36,1] relative overflow-hidden pointer-events-auto",
                className
            )}
        >
            {/* Background Grid */}
            <AtmosphericGrid opacity={0.02} size={28} />

            {/* Brand and Project Identity */}
            <div className="flex items-center gap-4 relative z-10 min-w-0">
                {/* Workspace Identity
                <div className="h-9 w-9 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 group/logo overflow-hidden relative transition-all duration-500 hover:border-primary/30 shrink-0">
                    <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                    <BookOpenText className="h-4.5 w-4.5 text-primary/60 relative z-10 transition-transform duration-500 group-hover/logo:scale-110" />
                </div>
*/}
                {/* Project Identification */}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="relative group/input">
                        <Input
                            className="h-7 px-1 py-0 text-[13px] font-black uppercase tracking-[0.1em] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[200px] max-w-[320px] text-foreground/90 truncate transition-all duration-300"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                            onBlur={onProjectNameBlur}
                            placeholder="Untitled Project"
                        />
                        <div className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-primary/60 group-hover/input:w-full transition-all duration-500" />
                    </div>

                    <div className="flex items-center gap-2.5 px-1">
                        <Badge
                            variant="outline"
                            className="text-[8px] font-black uppercase tracking-[0.22em] py-0 h-3.5 border-primary/20 bg-primary/5 text-primary/70 px-1.5"
                        >
                            v1.0
                        </Badge>
                        <div className="flex items-center gap-1 opacity-40">
                            <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground">Connected</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Actions */}
            <div className="flex items-center gap-3 relative z-10 shrink-0">
                <TooltipProvider delayDuration={200}>
                    {/* Action Toolbar */}
                    <div className="flex items-center gap-1 bg-muted/5 p-1 rounded-2xl border border-primary/5 transition-all duration-500 hover:border-primary/15">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".arkan"
                            className="hidden"
                        />

                        {/* Project Management */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => newSession()}
                                    className="h-8 w-8 xl:w-auto xl:px-3 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl text-muted-foreground"
                                >
                                    <PlusCircle className="h-4 w-4 shrink-0" />
                                    <span className="hidden xl:inline">New</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                New Project
                            </TooltipContent>
                        </Tooltip>

                        <LibraryHUD />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUploadClick}
                                    className="h-8 w-8 xl:w-auto xl:px-3 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl text-muted-foreground"
                                >
                                    <Upload className="h-4 w-4 shrink-0" />
                                    <span className="hidden xl:inline">Import</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Import Project
                            </TooltipContent>
                        </Tooltip>

                        <div className="h-5 w-px bg-primary/10 mx-1" aria-hidden />

                        {/* Persistence */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={hasUnsavedChanges ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={onSave}
                                    disabled={!hasUnsavedChanges || isSaving}
                                    className={cn(
                                        "h-8 px-4 gap-2 text-[9px] font-black uppercase tracking-[0.22em] transition-all duration-500 rounded-xl",
                                        hasUnsavedChanges && !isSaving
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98]"
                                            : "hover:bg-primary/10 hover:text-primary opacity-50 hover:opacity-100 text-muted-foreground"
                                    )}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                    ) : (
                                        <div className="relative shrink-0">
                                            <Save className="h-4 w-4" />
                                            {hasUnsavedChanges && !isSaving && (
                                                <div className="absolute -top-1.5 -right-1.5 h-2 w-2 bg-primary rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    )}
                                    <span className="hidden xl:inline">Save</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Save Progress
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
                                    className="h-8 w-8 xl:w-auto xl:px-3 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl text-muted-foreground disabled:opacity-30"
                                >
                                    <Download className="h-4 w-4 shrink-0" />
                                    <span className="hidden xl:inline">Download</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-[0.2em] bg-background/95 backdrop-blur-md border-primary/20 mt-3">
                                Download Backup
                            </TooltipContent>
                        </Tooltip>

                        <div className="h-5 w-px bg-primary/10 mx-1" aria-hidden />

                        <ExportHUD />
                    </div>
                </TooltipProvider>
            </div>
        </header>
    );
});

BuilderHeader.displayName = 'BuilderHeader';
