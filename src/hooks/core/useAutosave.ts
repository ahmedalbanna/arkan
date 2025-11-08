
'use client';

import { useEffect } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 2000) {
    const { project, hasUnsavedChanges, setHasUnsavedChanges } = useBuilderStore();
    const debouncedProject = useDebounce(project, delay);
    const { saveProject, isSaving } = useSaveProject();

    useEffect(() => {
        // Only save if the project has been debounced and has unsaved changes.
        if (debouncedProject && hasUnsavedChanges) {
            saveProject(() => {
                // This callback runs on successful save
                setHasUnsavedChanges(false);
            });
        }
    }, [debouncedProject, hasUnsavedChanges, saveProject, setHasUnsavedChanges]);

    return { isSaving };
}
