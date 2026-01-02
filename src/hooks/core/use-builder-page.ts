
'use client';

import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useInitializeBuilderStore } from '@/hooks';
import { userKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export function useBuilderPageLogic() {
  const { userProfile, firebaseUser, refetchUser } = useAuth();
  const { project, updateProject, isStoreInitialized } = useBuilderStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  // This ensures the store is hydrated from localStorage before we do anything.
  useInitializeBuilderStore();

  useEffect(() => {
    // Show onboarding if the user profile is loaded and onboarding is not complete.
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      if (!firebaseUser) throw new Error('User not authenticated');
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/users/${firebaseUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hasCompletedOnboarding: true })
      });
      if (!response.ok) throw new Error('Failed to update onboarding status');
      return response.json();
    },
    onSuccess: () => {
      // Refetch user data to get the updated onboarding status
      if (firebaseUser?.uid) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
      }
      refetchUser();
    },
    onError: (error: Error) => console.error('Failed to mark onboarding as complete:', error),
  });

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      onboardingMutation.mutate();
    }
  };

  const updateProjectName = useCallback((name: string) => {
    updateProject(p => { p.name = name; });
  }, [updateProject]);

  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    project,
    isStoreInitialized,
    updateProjectName,
  };
}
