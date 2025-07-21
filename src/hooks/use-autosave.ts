
'use client';

import { useEffect, useRef } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useSaveProject, useUpdateProject } from './use-projects';
import { useDebounce } from './use-debounce';

const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useAutosave() {
  const store = useBuilderStore();
  const debouncedHasUnsavedChanges = useDebounce(store.hasUnsavedChanges, AUTOSAVE_DELAY);

  const saveProjectMutation = useSaveProject();
  const updateProjectMutation = useUpdateProject();

  const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;
  const wasSaving = useRef(false);

  useEffect(() => {
    // Set wasSaving to true when a save starts
    if (isSaving) {
      wasSaving.current = true;
    }
    // Only reset the unsaved changes flag if a save operation has just completed
    else if (wasSaving.current && !isSaving) {
      store.setHasUnsavedChanges(false);
      wasSaving.current = false;
    }
  }, [isSaving, store.setHasUnsavedChanges]);


  useEffect(() => {
    if (debouncedHasUnsavedChanges && !isSaving) {
      const projectData = store.getFullState();

      if (!projectData.proposal) {
        // Can't save without a proposal
        return;
      }
      
      const saveData = { ...projectData, name: projectData.proposal.title };

      if (store.currentProjectId) {
        // Update existing project
        updateProjectMutation.mutate({ projectId: store.currentProjectId, data: projectData });
      } else {
        // Save new project
        saveProjectMutation.mutate(saveData);
      }
    }
  }, [
      debouncedHasUnsavedChanges, 
      store, 
      saveProjectMutation, 
      updateProjectMutation, 
      isSaving
    ]);
}

    