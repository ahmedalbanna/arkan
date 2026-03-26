
'use client';

import { projectFromFile, downloadProjectAsFile } from '@/modules/projects/infrastructure/io/io';
import { useBuilderStore } from '@/modules/projects/adapters/state/useBuilderStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from '@/hooks/util/use-toast';
import type { Project } from '@/modules/projects/domain/entities/Project';

/**
 * Custom hook for handling project file operations (upload, download, etc.)
 * with proper error handling and toast notifications.
 */
export function useProjectFileOperations() {
    const router = useRouter();
    const { loadProjectFromFile } = useBuilderStore();

    const handleUploadProject = useCallback(async (file: File) => {
        try {
            const project = await projectFromFile(file);
            await loadProjectFromFile(file);
            router.push('/builder');
            toast({ title: 'Success', description: 'Project loaded successfully.' });
            return project;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload project';
            toast({ 
                title: 'Upload Failed', 
                description: errorMessage, 
                variant: 'destructive' 
            });
            console.error('Project upload error:', error);
            throw error;
        }
    }, [router, loadProjectFromFile]);

    const handleDownloadProject = useCallback((project: Project) => {
        try {
            if (!project.hasContent()) {
                toast({ 
                    title: 'Cannot Download', 
                    description: 'Project is empty. Please add content before downloading.',
                    variant: 'destructive'
                });
                return;
            }
            downloadProjectAsFile(project);
            toast({ title: 'Success', description: 'Project downloaded successfully.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to download project';
            toast({ 
                title: 'Download Failed', 
                description: errorMessage, 
                variant: 'destructive' 
            });
            console.error('Project download error:', error);
        }
    }, []);

    return {
        handleUploadProject,
        handleDownloadProject,
    };
}
