
'use client';

import type { Project } from '@/lib/models';
import { useEffect, useRef } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 2000) {
    const { hasUnsavedChanges, project } = useBuilderStore();
    const { saveProjectMutation } = useSaveProject();

    // Debounce the entire project object. The effect will only run when the
    // project state has been stable for the duration of the delay.
    const debouncedProject = useDebounce<Project | null>(project, delay);

    // Use a ref to track if a save is currently in progress to avoid concurrent saves.
    const isSavingRef = useRef(false);

    useEffect(() => {
        // Trigger autosave only if there are unsaved changes and a debounced project is available.
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
