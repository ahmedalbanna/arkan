// code explantion in docs/hooks/use-autosave.md

"use client";

import { useEffect, useRef, useState } from "react";
import { useBuilderStore } from "./useBuilderStore";
import { useSaveProject, useUpdateProject } from "./use-projects";
import { useDebounce } from "./use-debounce";

const AUTOSAVE_DELAY = 60000; // 1 minute

export function useAutosave() {
  const store = useBuilderStore();
  const { hasUnsavedChanges, setHasUnsavedChanges } = store;
  const debouncedHasUnsavedChanges = useDebounce(
    hasUnsavedChanges,
    AUTOSAVE_DELAY
  );

  const saveProjectMutation = useSaveProject();
  const updateProjectMutation = useUpdateProject();

  const isSaving =
    saveProjectMutation.isPending || updateProjectMutation.isPending;
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    // If an autosave is in progress or just finished, and there are no new changes,
    // we can reset the unsaved changes flag.
    if (isAutoSaving && !isSaving && !hasUnsavedChanges) {
      setIsAutoSaving(false);
    }
  }, [isSaving, hasUnsavedChanges, isAutoSaving]);

  useEffect(() => {
    // Trigger autosave only if there are debounced unsaved changes,
    // and we are not currently in the process of saving anything.
    if (debouncedHasUnsavedChanges && !isSaving && !isAutoSaving) {
      setIsAutoSaving(true); // Mark the start of an autosave operation

      const projectData = store.getFullState();
      if (!projectData.proposal) {
        setIsAutoSaving(false); // Reset if there's nothing to save
        return;
      }

      const saveData = {
        ...projectData,
        name: projectData.name || projectData.proposal.title,
      };

      const onSettled = () => {
        // After the mutation completes (success or error), mark autosave as finished
        // and reset the unsaved changes flag in the store.
        setHasUnsavedChanges(false);
        setIsAutoSaving(false);
      };

      if (store.currentProjectId) {
        updateProjectMutation.mutate(
          { projectId: store.currentProjectId, data: projectData },
          { onSettled }
        );
      } else {
        saveProjectMutation.mutate(saveData, { onSettled });
      }
    }
  }, [
    debouncedHasUnsavedChanges,
    store,
    isSaving,
    isAutoSaving,
    saveProjectMutation,
    updateProjectMutation,
    setHasUnsavedChanges,
  ]);
}
