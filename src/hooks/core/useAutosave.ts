
'use client';

import { useEffect, useRef } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';
import type { Project } from '@/lib/models';

export function useAutosave(delay = 2000) {
    const { hasUnsavedChanges, project } = useBuilderStore();
    const { saveProjectMutation } = useSaveProject();

    const debouncedProject = useDebounce<Project | null>(project, delay);
    const isSavingRef = useRef(false);

    useEffect(() => {
        if (hasUnsavedChanges && debouncedProject && !saveProjectMutation.isPending && !isSavingRef.current) {
            isSavingRef.current = true;
            saveProjectMutation.mutate(debouncedProject.toStateObject(), {
                onSettled: () => {
                    isSavingRef.current = false;
                }
            });
        }
    }, [debouncedProject, hasUnsavedChanges, saveProjectMutation]);

    return { isSaving: saveProjectMutation.isPending };
}
