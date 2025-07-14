
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, Upload } from 'lucide-react';
import { useBuilderState } from '@/context/BuilderStateContext';
import { useRef } from 'react';

export const SessionActions = () => {
    const { state, handleNewSession, handleSaveProjectFile, handleLoadProjectFile, isAnythingGenerating, isGeneratingProposal } = useBuilderState();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isDisabled = isAnythingGenerating || isGeneratingProposal;
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleLoadProjectFile(event.target.files?.[0] ?? null);
        // Reset file input to allow uploading the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                disabled={!state.proposal || isDisabled}
                title="Download all generated content and proposal into a single file"
            >
                <Download className="mr-2 h-4 w-4" />
                Download Project
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={handleNewSession}
                disabled={isDisabled}
                title="Clear all content and start a new session"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                New Session
            </Button>
        </div>
    );
}
