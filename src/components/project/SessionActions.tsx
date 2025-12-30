
'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Save, Trash2, Upload, Download } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject } from '@/hooks';
import { useRouter } from 'next/navigation';
import { ExportDialog } from './ExportDialog';
import { BrowseProjectsDialog } from './BrowseProjectsDialog';
import { useRef } from 'react';

interface SessionActionsProps {
    saveProject: () => void;
    isSaving: boolean;
}

export function SessionActions({ saveProject, isSaving }: SessionActionsProps) {
    const { t } = useLocalization();
    const router = useRouter();
    const { project, hasUnsavedChanges, newSession, loadProjectFromFile } = useBuilderStore();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await loadProjectFromFile(file);
            router.push('/builder');
        }
        if (e.target) e.target.value = '';
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
                    onClick={saveProject}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="h-8 w-8 md:w-auto md:px-3"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="hidden md:inline ms-2">{t('projects.saveButton')}</span>
                </Button>

                <ExportDialog />
                
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                        >
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => project?.downloadAsFile()}
                                disabled={!hasContent}
                                className="h-8 w-8 md:w-auto md:px-3"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden md:inline ms-2">Download</span>
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('builder.tooltips.downloadProject')}</p>
                    </TooltipContent>
                </Tooltip>


                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => newSession()}
                            className="h-8 w-8"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t('builder.buttons.newSession')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('builder.tooltips.newSession')}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
