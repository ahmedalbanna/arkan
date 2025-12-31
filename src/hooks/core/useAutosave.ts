
'use client';

import { useEffect } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 5000) { // Increased delay to 5 seconds
    const { hasUnsavedChanges, setHasUnsavedChanges, project } = useBuilderStore();
    const debouncedUnsavedChanges = useDebounce(hasUnsavedChanges, delay);
    const { saveProjectMutation } = useSaveProject();

    useEffect(() => {
        // This effect triggers when `debouncedUnsavedChanges` becomes true.
        // It means the user has made changes and has been idle for the delay period.
        if (debouncedUnsavedChanges && project) {
            saveProjectMutation.mutate(project.toStateObject());
        }
    }, [debouncedUnsavedChanges, project, saveProjectMutation]);

    return { isSaving: saveProjectMutation.isPending };
}
