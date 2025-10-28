
'use client';

import { useRef, useCallback } from 'react';
import { useBuilderStore, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

export function useUploadProjectLogic() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loadProject } = useBuilderStore();
    const { toast } = useToast();
    const { t } = useLocalization();

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const projectData = JSON.parse(event.target?.result as string);
                    if (projectData.id && projectData.userId && projectData.createdAt) {
                        loadProject(projectData);
                        toast({ title: t('builder.toasts.projectLoadedTitle'), description: t('builder.toasts.projectLoadedDesc', { projectName: projectData.name }) });
                    } else {
                        throw new Error(t('builder.errors.invalidProjectFile'));
                    }
                } catch (err) {
                    toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
                }
            };
            reader.readAsText(file);
        }
        // Reset file input to allow re-uploading the same file
        if(e.target) e.target.value = '';

    }, [loadProject, toast, t]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return {
        fileInputRef,
        handleUploadClick,
        onFileChange,
        t
    };
}
