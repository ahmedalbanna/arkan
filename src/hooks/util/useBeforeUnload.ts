'use client';

import { useEffect } from 'react';
import { useBuilderStore } from '../core/useBuilderStore';

/**
 * Hook to prompt the user before they leave the page if there are unsaved changes.
 */
export function useBeforeUnload() {
  const { status } = useBuilderStore();
  const hasUnsavedChanges = status === 'dirty';

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        // Modern browsers show a generic message, but this is required for older ones.
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
