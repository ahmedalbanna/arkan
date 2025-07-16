
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

export const SessionActions = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Select multiple state slices from the store
    const { 
        proposal, 
        isAnythingGenerating, 
        isGeneratingProposal, 
        newSession,
        loadState
    } = useBuilderStore(state => ({
        proposal: state.proposal,
        isAnythingGenerating: state.isAnythingGenerating,
        isGeneratingProposal: state.isGeneratingProposal,
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


    const isDisabled = isAnythingGenerating || isGeneratingProposal;
    
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
                    throw new Error('Invalid project file structure.');
                }
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: 'Load Failed', description: 'The selected file could not be read or is corrupted.', variant: 'destructive' });
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
                disabled={isDisabled}
                title="Upload a previously saved project file"
            >
                <Upload className="mr-2 h-4 w-4" />
                Upload Project
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProjectFile}
                disabled={!proposal || isDisabled}
                title="Download all generated content and proposal into a single file"
            >
                <Download className="mr-2 h-4 w-4" />
                Download Project
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={newSession}
                disabled={isDisabled}
                title="Clear all content and start a new session"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                New Session
            </Button>
        </div>
    );
}
