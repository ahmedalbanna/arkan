
'use client';

import type { Project } from '@/lib/models';
import { useEffect, useRef } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 200000) {
    const { hasUnsavedChanges, project } = useBuilderStore();
    const { saveProjectMutation } = useSaveProject();

    const debouncedProject = useDebounce<Project | null>(project, delay);

    useEffect(() => {
        // Trigger autosave only if there are unsaved changes and a debounced project is available.
        if (hasUnsavedChanges && debouncedProject && !saveProjectMutation.isPending) {
             saveProjectMutation.mutate(debouncedProject.toStateObject());
        }
    }, [debouncedProject, hasUnsavedChanges, saveProjectMutation]);

    return { isSaving: saveProjectMutation.isPending };
}
