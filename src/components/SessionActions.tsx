
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

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
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".json"
                className="hidden"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                title={t('builder.tooltips.uploadProject')}
            >
                <Upload className="mr-2 h-4 w-4" />
                {t('builder.buttons.uploadProject')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProjectFile}
                disabled={!proposal}
                title={t('builder.tooltips.downloadProject')}
            >
                <Download className="mr-2 h-4 w-4" />
                {t('builder.buttons.downloadProject')}
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={newSession}
                title={t('builder.tooltips.newSession')}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('builder.buttons.newSession')}
            </Button>
        </div>
    );
}
