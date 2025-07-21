
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export const SessionActions = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { t } = useLocalization();

    // Select multiple state slices from the store
    const { 
        proposal, 
        newSession,
        loadState
    } = useBuilderStore(state => ({
        proposal: state.proposal,
        newSession: state.newSession,
        loadState: state.loadState
    }));

    const stateToSave = useBuilderStore(state => ({
        projectIdea: state.projectIdea,
        proposal: state.proposal,
        sections: state.sections,
        diagrams: state.diagrams,
        evaluation: state.evaluation,
        presentation: state.presentation,
        codeGenerator: state.codeGenerator,
    }));


    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedState = JSON.parse(content);
                // Basic validation
                if (parsedState.proposal) {
                    loadState(parsedState);
                } else {
                    throw new Error(t('builder.errors.invalidProjectFile'));
                }
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleSaveProjectFile = () => {
        if (!proposal) return;
        const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json;charset=utf-8' });
        saveAs(blob, `${proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.json`);
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept=".json"
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
                            <span className="hidden md:inline ml-2">{t('builder.buttons.uploadProject')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.uploadProject')}</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSaveProjectFile}
                            disabled={!proposal}
                             className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Download className="h-4 w-4" />
                             <span className="hidden md:inline ml-2">{t('builder.buttons.downloadProject')}</span>
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
                            onClick={newSession}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Trash2 className="h-4 w-4" />
                             <span className="hidden md:inline ml-2">{t('builder.buttons.newSession')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>{t('builder.tooltips.newSession')}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
