'use client';

import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useInitializeBuilderStore } from '@/hooks';
import { userKeys } from '@/infrastructure/api/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { ProjectProperties } from '@/modules/projects/domain/entities/Project';

export function useBuilderPageLogic(initialProject?: ProjectProperties | null) {
  const { userProfile, user, refetchUser } = useAuth();
  const project = useBuilderStore(state => state.project);
  const updateProject = useBuilderStore(state => state.updateProject);
  const isStoreInitialized = useBuilderStore(state => state.isStoreInitialized);
  const loadProject = useBuilderStore(state => state.loadProject);

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
      if (!user) {
        throw new Error('User not authenticated');
      }

      return apiService<{ hasCompletedOnboarding: boolean }, unknown>({
        endpoint: `/api/users/${user.uid}`,
        method: 'PUT',
        data: { hasCompletedOnboarding: true },
      });
    },
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
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
    updateProject((currentProject) => currentProject.withProps({ name }));
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
