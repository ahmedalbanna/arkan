'use client';

import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useInitializeBuilderStore } from '@/hooks';
import { userKeys } from '@/lib/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { ProjectProperties } from '@/lib/types';

export function useBuilderPageLogic(initialProject?: ProjectProperties | null) {
  const { userProfile, firebaseUser, refetchUser } = useAuth();
  const { project, updateProject, isStoreInitialized, loadProject } = useBuilderStore();

  useEffect(() => {
    if (initialProject && isStoreInitialized && project?.id !== initialProject.id) {
        loadProject(initialProject);
    }
  }, [initialProject, isStoreInitialized, loadProject, project?.id]);
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
