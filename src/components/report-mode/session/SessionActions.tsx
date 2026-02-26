
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
import { useProjectFileOperations } from '@/hooks/core/useProjectFileOperations';
import { useSaveProject } from '@/hooks/data/use-projects';
import { Download, Loader2, PlusCircle, Save, Upload } from 'lucide-react';
import { useRef } from 'react';
import { BrowseProjectsDialog } from './BrowseProjectsDialog';
import { ExportDialog } from './ExportDialog'; 

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
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept=".arkan"
                    className="hidden"
                />

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => newSession()}
                    className="h-8 w-8 md:w-auto md:px-3"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden md:inline ms-2">New Project</span>
                </Button>

                <BrowseProjectsDialog />

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
                    <TooltipContent>
                        <p>{t('builder.tooltips.uploadProject')}</p>
                    </TooltipContent>
                </Tooltip>

                <Button
                    variant="default"
                    size="icon"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="h-8 w-8 md:w-auto md:px-3"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="hidden md:inline ms-2">{t('projects.saveButton')}</span>
                </Button>
                
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDownload}
                            disabled={!hasContent}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Download className="h-4 w-4" />
                             <span className="hidden md:inline ms-2">{t('builder.buttons.downloadProject')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('builder.tooltips.downloadProject')}</p>
                    </TooltipContent>
                </Tooltip>

                <ExportDialog />

            </div>
        </TooltipProvider>
    );
}
