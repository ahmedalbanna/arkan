'use client';

import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useInitializeBuilderStore } from '@/hooks';
import { userKeys } from '@/lib/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export function useBuilderPageLogic() {
  const { userProfile, firebaseUser, refetchUser } = useAuth();
  const { project, updateProject, isStoreInitialized } = useBuilderStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  useInitializeBuilderStore();

  useEffect(() => {
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      return apiService<{ hasCompletedOnboarding: boolean }, unknown>({
        endpoint: `/api/users/${firebaseUser.uid}`,
        method: 'PUT',
        data: { hasCompletedOnboarding: true },
        firebaseUser,
      });
    },
    onSuccess: () => {
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
    updateProject((currentProject) => currentProject.with({ name }));
  }, [updateProject]);

  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    project,
    isStoreInitialized,
    updateProjectName,
    updateProject,
  };
}
