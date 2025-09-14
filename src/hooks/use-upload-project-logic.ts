
'use client';

import { useRef } from 'react';
import { useBuilderStore } from '@/hooks';
import { useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { type SavedProject } from '@/lib/types';

export function useUploadProjectLogic() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loadProject, newSession } = useBuilderStore();
    const { toast } = useToast();
    const { t } = useLocalization();

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const decodedJson = decodeURIComponent(escape(atob(content)));
                const parsedState = JSON.parse(decodedJson);
                // Here, you would ideally validate the parsedState against a Zod schema
                // before loading it into the store to ensure data integrity.
                loadProject(parsedState as SavedProject);
                toast({
                    title: t('builder.toasts.projectLoadedTitle'),
                    description: t('builder.toasts.projectLoadedDesc').replace('{projectName}', parsedState.name || 'the project'),
                });
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        // Reset the file input to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        newSession();
        fileInputRef.current?.click();
    };

    return {
        fileInputRef,
        handleUploadClick,
        onFileChange,
        t
    };
}
