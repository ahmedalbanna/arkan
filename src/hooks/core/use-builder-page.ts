
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { localProjectService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

const LAST_PROJECT_ID_KEY = 'lastActiveProjectId';

export function useBuilderPageLogic() {
  const { project: projectFromStore, loadProject, updateProject } = useBuilderStore();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const { t, locale } = useLocalization();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // When the project in the global store changes, save its ID to localStorage.
  useEffect(() => {
    if (isClient && projectFromStore?.id) {
      localStorage.setItem(LAST_PROJECT_ID_KEY, projectFromStore.id);
    }
  }, [projectFromStore?.id, isClient]);

  // Effect to load the last active project on initial mount
  useEffect(() => {
    setIsClient(true); // Component has mounted
    const lastProjectId = localStorage.getItem(LAST_PROJECT_ID_KEY);
    if (lastProjectId && !projectFromStore) { // Only load if no project is in the store
      localProjectService.getProject(lastProjectId).then(projectData => {
        if (projectData) {
          loadProject(projectData);
        }
      });
    }
  }, [loadProject, projectFromStore]);


  useEffect(() => {
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hasCompletedOnboarding: true })
      });
      if (!response.ok) throw new Error('Failed to update onboarding status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', firebaseUser?.uid] });
      refetchUser();
    },
    onError: (error: Error) => {
      console.error('Failed to mark onboarding as complete:', error);
    }
  });

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      onboardingMutation.mutate();
    }
  };

  const updateProjectName = useCallback((name: string) => {
    updateProject(p => p.with({ name }));
  }, [updateProject]);
  
  const isLoadingProject = isClient && !projectFromStore && !!localStorage.getItem(LAST_PROJECT_ID_KEY);


  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    t,
    locale,
    project: projectFromStore,
    isLoadingProject,
    updateProjectName,
  };
}
