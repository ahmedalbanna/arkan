
'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Loader2, Save, Trash2, Upload } from 'lucide-react';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject, useToast } from '@/hooks';
import { useRouter } from 'next/navigation';

export const SessionActions = () => {
    const { t } = useLocalization();
    const router = useRouter();
    const { toast } = useToast();
    const {
        fileInputRef,
        handleUploadClick,
        onFileChange,
        handleDownloadAs,
        hasContent,
        hasUnsavedChanges,
        newSession,
    } = useBuilderStore();

    const { saveProject, isSaving } = useSaveProject();

    const handleSave = () => {
        saveProject();
    };

    const isBusy = isSaving;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e, toast, t, router)}
                    accept=".arkan"
                    className="hidden"
                />

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
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.uploadProject')}</p>
                    </TooltipContent>
                </Tooltip>

                <Button
                    variant="default"
                    size="icon"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isBusy}
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
                            onClick={handleDownloadAs}
                            disabled={isBusy || !hasContent}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">Download</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.downloadProject')}</p>
                    </TooltipContent>
                </Tooltip>


                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => newSession()}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden md:inline ms-2">{t('builder.buttons.newSession')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.newSession')}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
