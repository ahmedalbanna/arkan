
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { useBuilderState } from '@/context/BuilderStateContext';

export const SessionActions = () => {
    const { state, handleNewSession, handleSaveProjectFile, isAnythingGenerating, isGeneratingProposal } = useBuilderState();

    const isDisabled = isAnythingGenerating || isGeneratingProposal;

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProjectFile}
                disabled={!state.proposal || isDisabled}
                title="Download all generated content and proposal into a single file"
            >
                <Download className="mr-2 h-4 w-4" />
                Download Project File
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
