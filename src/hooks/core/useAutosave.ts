
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
        if (debouncedProject && debouncedProject.hasUnsavedChanges) {
            saveProject();
        }
    }, [debouncedProject, saveProject]);

    return { isSaving };
}
