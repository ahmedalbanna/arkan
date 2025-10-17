
'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef } from 'react';
import { useDebounce } from './use-debounce';
import { useUpdateProject } from './use-projects';
import { useBuilderStore } from './useBuilderStore';

/**
 * Custom hook to automatically save project changes to the database.
 * It debounces changes to avoid excessive API calls.
 */
export function useAutosave() {
  const { firebaseUser } = useAuth();
  const {
    project,
    hasUnsavedChanges
  } = useBuilderStore();

  const updateProjectMutation = useUpdateProject();

  // Create a ref to hold the full state to avoid it being a dependency of useEffect
  const projectRef = useRef(project);
  projectRef.current = project; // Always keep it up-to-date

  // Debounce the unsaved changes flag
  const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, 1500); // 1.5-second debounce delay

  useEffect(() => {
    const currentProject = projectRef.current;
    const currentProjectId = currentProject?.id;

    // Trigger save only if there's a current project ID, debounced changes are true, and the user is logged in.
    if (currentProjectId && !currentProjectId.startsWith('temp-') && debouncedHasUnsavedChanges && firebaseUser) {
      // Don't show a toast for autosave, it would be too noisy.
      const stateToSave = currentProject.toStateObject();
      updateProjectMutation.mutate({
        projectId: currentProjectId,
        data: stateToSave,
      });
    }
  }, [debouncedHasUnsavedChanges, firebaseUser, updateProjectMutation]);

}
