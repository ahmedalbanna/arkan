
'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Save, Trash2, Upload, Download, CheckCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useRouter } from 'next/navigation';
import { ExportDialog } from './ExportDialog';
import { BrowseProjectsDialog } from './BrowseProjectsDialog';
import { useRef } from 'react';
import { useSaveProject } from '@/hooks/data/use-projects';
import { cn } from '@/lib/utils/cn';

interface SessionActionsProps {
    isSaving: boolean;
}

export function SessionActions({ isSaving }: SessionActionsProps) {
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

    const getSaveStatus = () => {
        if (isSaving) {
            return {
                text: "Saving...",
                icon: <Loader2 className="h-4 w-4 animate-spin" />,
                variant: "secondary" as const
            };
        }
        if (!hasUnsavedChanges) {
            return {
                text: "Saved",
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                variant: "ghost" as const
            };
        }
        return {
            text: "Unsaved",
            icon: <Save className="h-4 w-4 text-yellow-500" />,
            variant: "secondary" as const
        };
    };

    const saveStatus = getSaveStatus();

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
                    variant={saveStatus.variant}
                    size="sm"
                    disabled={isSaving}
                    className={cn("h-8 w-28", !hasUnsavedChanges && !isSaving && "text-muted-foreground")}
                >
                    {saveStatus.icon}
                    <span className="ms-2">{saveStatus.text}</span>
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

                <ExportDialog />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
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
