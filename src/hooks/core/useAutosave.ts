
'use client';

import { useEffect } from 'react';
import { useDebounce } from '../util/use-debounce';
import { useSaveProject } from '../data/use-projects';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 2000) {
    const { project } = useBuilderStore();
    const debouncedProject = useDebounce(project, delay);
    const { saveProject, isSaving } = useSaveProject();

    useEffect(() => {
        // Only save if the project has been debounced and has unsaved changes.
        // Also ensure it's not a new, temporary project (which wouldn't have a userId yet in the old system,
        // but now we check if it has a proper ID from the DB)
        if (debouncedProject && debouncedProject.hasUnsavedChanges) {
            saveProject();
        }
    }, [debouncedProject, saveProject]);

    return { isSaving };
}
