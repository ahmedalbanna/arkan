
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

// This hook is now deprecated and its logic has been merged into useBuilderStore
// for better co-location of state and its management logic.
// It is kept for reference but can be safely removed in the future.

export function useBuilderPageLogic() {
  const { project, updateProject } = useBuilderStore();
  const { userProfile, refetchUser } = useAuth();
  const { t, locale } = useLocalization();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  const updateProjectName = useCallback((name: string) => {
    updateProject(p => p.with({ name }));
  }, [updateProject]);

  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete: () => {}, // This logic is now internal to the store/auth context
    t,
    locale,
    project,
    isLoadingProject: !project, // Simplified loading state
    updateProjectName,
  };
}
