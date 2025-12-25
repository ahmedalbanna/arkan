
'use client';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Save, Trash2, Upload, Settings, ChevronDown, FolderOpen, DownloadCloud, FileDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSaveProject } from '@/hooks';
import { useRouter } from 'next/navigation';
import { ExportDialog } from './ExportDialog';
import { useState } from 'react';
import { ProjectSettingsDialog } from './ProjectSettingsDialog';

export function SessionActions() {
    const { t } = useLocalization();
    const router = useRouter();
    const {
        fileInputRef,
        handleUploadClick,
        onFileChange,
        hasUnsavedChanges,
        newSession,
    } = useBuilderStore();

    const { saveProject, isSaving } = useSaveProject();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    function handleSave() {
        saveProject();
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e, t, router)}
                    accept=".arkan"
                    className="hidden"
                />

                <ProjectSettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

                {/* Project Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 md:w-auto md:px-3">
                            <FolderOpen className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Project</span>
                            <ChevronDown className="h-4 w-4 ml-1 hidden md:inline"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={handleUploadClick}>
                            <Upload className="mr-2 h-4 w-4" />
                            <span>{t('builder.buttons.uploadProject')}</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Project Settings</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Save Button */}
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

                 {/* Export/Download Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 md:w-auto md:px-3">
                             <DownloadCloud className="h-4 w-4 md:mr-2" />
                             <span className="hidden md:inline">Export / Download</span>
                             <ChevronDown className="h-4 w-4 ml-1 hidden md:inline"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <ExportDialog>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <FileDown className="mr-2 h-4 w-4" />
                                <span>Export as DOCX/PPTX</span>
                            </DropdownMenuItem>
                        </ExportDialog>
                        <DropdownMenuItem onSelect={() => document.getElementById('download-project-button')?.click()}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>{t('builder.buttons.downloadProject')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Hidden download button */}
                <div style={{ display: 'none' }}>
                    <Button id="download-project-button" onClick={() => useBuilderStore.getState().project?.downloadAsFile()} />
                </div>


                {/* New Session Button */}
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

