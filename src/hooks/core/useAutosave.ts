
'use client';

import { useEffect } from 'react';
import { useSaveProject } from '../data/use-projects';
import { useDebounce } from '../util/use-debounce';
import { useBuilderStore } from './useBuilderStore';

export function useAutosave(delay = 5000) { // Increased delay to 5 seconds
    const { project, hasUnsavedChanges, setHasUnsavedChanges } = useBuilderStore();
    const debouncedUnsavedChanges = useDebounce(hasUnsavedChanges, delay);
    const { saveProject, isSaving } = useSaveProject();

    useEffect(() => {
        // This effect triggers when the `debouncedHasUnsavedChanges` becomes true.
        // It means the user has made changes and has been idle for the delay period.
        if (debouncedUnsavedChanges) {
            // New: Before saving, get the absolute latest content from the editor instance
            const getLatestContent = (window as any).__getEditorContent;
            if (getLatestContent) {
                const latestMarkdown = getLatestContent();
                const activeEditorSectionId = useBuilderStore.getState().project?.activeSectionId;
                
                // Update the project state silently without causing a re-render loop
                if (activeEditorSectionId) {
                    useBuilderStore.setState(state => {
                        const updatedProject = state.project?.updateSectionContent(activeEditorSectionId, latestMarkdown);
                        return { project: updatedProject };
                    }, true); // The 'true' here replaces the state without merging
                }
            }
            
            // Now, save the project. The project object in the store is up-to-date.
            saveProject(() => {
                // This callback runs on successful save.
                setHasUnsavedChanges(false);
            });
        }
    }, [debouncedUnsavedChanges, saveProject, setHasUnsavedChanges]);

    return { isSaving };
}
