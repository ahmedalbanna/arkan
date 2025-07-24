Okay, I will explain the code in `f:\arkan\src\hooks\use-autosave.ts`. This code defines a custom React hook called `useAutosave` that automatically saves project data at regular intervals. Let's break it down:

**1. Purpose:**

- The `useAutosave` hook is designed to automatically save the user's project data in the background, providing a safety net against data loss and improving the user experience. It saves data to the backend using the `useSaveProject` and `useUpdateProject` hooks.

**2. Key Concepts:**

- **Autosaving:** Automatically saving data without explicit user intervention.
- **`useEffect`:** Used to trigger the autosave logic whenever certain dependencies change.
- **`useRef` (implicit):** While `useRef` isn't explicitly used, the `store` object obtained via `useBuilderStore` likely maintains its state using `useRef` internally within Zustand.
- **`useState`:** Used to track whether an autosave operation is in progress (`isAutoSaving`).
- **`useDebounce`:** Used to delay the autosave operation until the user has stopped making changes for a specified duration. This prevents excessive saving and reduces the load on the backend.
- **TanStack Query Mutations:** `useSaveProject` and `useUpdateProject` are TanStack Query mutations that handle the actual saving of data to the backend API.

**3. Code Breakdown:**

```typescript
content_copyaddcompare_arrowsopen_in_full'use client';

import { useEffect, useRef, useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useSaveProject, useUpdateProject } from './use-projects';
import { useDebounce } from './use-debounce';

const AUTOSAVE_DELAY = 60000; // 1 minute

export function useAutosave() {
  const store = useBuilderStore();
  const { hasUnsavedChanges, setHasUnsavedChanges } = store;
  const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, AUTOSAVE_DELAY);

  const saveProjectMutation = useSaveProject();
  const updateProjectMutation = useUpdateProject();

  const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;
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

      const saveData = { ...projectData, name: projectData.name || projectData.proposal.title };

      const onSettled = () => {
        // After the mutation completes (success or error), mark autosave as finished
        // and reset the unsaved changes flag in the store.
        setHasUnsavedChanges(false);
        setIsAutoSaving(false);
      };

      if (store.currentProjectId) {
        updateProjectMutation.mutate({ projectId: store.currentProjectId, data: projectData }, { onSettled });
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
```

- **`AUTOSAVE_DELAY`**: Defines the delay (in milliseconds) before triggering an autosave (60000 ms = 1 minute).
- **`useAutosave()`**: The main custom hook.
- **`const store = useBuilderStore();`**: Retrieves the Zustand store containing project data and state management functions.
- **`const { hasUnsavedChanges, setHasUnsavedChanges } = store;`**: Extracts the `hasUnsavedChanges` flag and `setHasUnsavedChanges` action from the store.
- **`const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, AUTOSAVE_DELAY);`**: Creates a debounced version of the `hasUnsavedChanges` flag. The `debouncedHasUnsavedChanges` variable will only be true after `hasUnsavedChanges` has been true for `AUTOSAVE_DELAY` milliseconds.
- **`const saveProjectMutation = useSaveProject();`**: Gets the `useSaveProject` mutation hook for creating a new project.
- **`const updateProjectMutation = useUpdateProject();`**: Gets the `useUpdateProject` mutation hook for updating an existing project.
- **`const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;`**: Checks if either the save or update mutation is currently in a pending (saving) state.
- **`const [isAutoSaving, setIsAutoSaving] = useState(false);`**: Creates a state variable to track whether an autosave operation is in progress. This helps to prevent multiple autosaves from running concurrently.
- **`useEffect(() => { ... }, [isSaving, hasUnsavedChanges, isAutoSaving]);`**: This `useEffect` hook is used to reset the `isAutoSaving` flag when a save operation completes and there are no more unsaved changes. This ensures that the UI accurately reflects the autosave status.
- **`useEffect(() => { ... }, [debouncedHasUnsavedChanges, store, isSaving, isAutoSaving, saveProjectMutation, updateProjectMutation, setHasUnsavedChanges]);`**: This `useEffect` hook contains the core autosave logic.
    - It checks if there are `debouncedHasUnsavedChanges` (meaning the user has paused editing), and that no save operation is currently in progress (`!isSaving`) and an auto-save is not already running (`!isAutoSaving`).
    - If all conditions are met, it sets `setIsAutoSaving(true)` to indicate that an autosave is starting.
    - It retrieves the complete project data using `store.getFullState()`.
    - It checks if `projectData.proposal` exists. If not, it resets `setIsAutoSaving(false)` and returns, as there's nothing to save.
    - It prepares the `saveData` object, including the project name from either the existing name or the proposal title.
    - It defines an `onSettled` callback function that will be executed after the save or update mutation completes (either successfully or with an error). This function resets the `hasUnsavedChanges` flag in the store using `setHasUnsavedChanges(false)` and sets `setIsAutoSaving(false)`.
    - It checks if a `store.currentProjectId` exists. If so, it calls `updateProjectMutation.mutate` to update the existing project. Otherwise, it calls `saveProjectMutation.mutate` to create a new project. The `onSettled` callback is passed to the `mutate` function to handle post-mutation cleanup.

**In Summary:**

The `useAutosave` hook provides automatic saving functionality for project data. It uses a debounce to prevent excessive saving, tracks the autosave status, and integrates with TanStack Query mutations to persist data to the backend. It enhances the user experience by ensuring that their work is regularly saved without manual intervention.
