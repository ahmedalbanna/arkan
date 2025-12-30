'use client';

import { useEffect } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 5000) { // Increased delay to 5 seconds
    const { hasUnsavedChanges, setHasUnsavedChanges } = useBuilderStore();
    const debouncedUnsavedChanges = useDebounce(hasUnsavedChanges, delay);
    const { saveProject, isSaving } = useSaveProject();

    useEffect(() => {
        // This effect triggers when `debouncedUnsavedChanges` becomes true.
        // It means the user has made changes and has been idle for the delay period.
        if (debouncedUnsavedChanges) {
            saveProject(() => {
                // This callback runs on successful save.
                setHasUnsavedChanges(false);
            });
        }
    }, [debouncedUnsavedChanges, saveProject, setHasUnsavedChanges]);

    return { isSaving };
}
