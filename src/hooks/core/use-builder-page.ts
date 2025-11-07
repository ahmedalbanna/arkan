
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useFeatures, useProject } from '@/hooks';
import { localProjectService } from '@/services';

const LAST_PROJECT_ID_KEY = 'lastActiveProjectId';

export function useBuilderPageLogic() {
  const { project: projectFromStore, loadProject, updateProject, hasUnsavedChanges, setHasUnsavedChanges } = useBuilderStore();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const { t, locale } = useLocalization();
  const queryClient = useQueryClient();
  const { features, isLoaded: featuresLoaded } = useFeatures();

  const [activeTab, setActiveTab] = useState<string>('files');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // No longer use a separate state for project ID. The store is the source of truth.

  // When the project in the global store changes, save its ID to localStorage.
  useEffect(() => {
    if (projectFromStore?.id) {
      localStorage.setItem(LAST_PROJECT_ID_KEY, projectFromStore.id);
    }
  }, [projectFromStore?.id]);

  // Effect to load the last active project on initial mount
  useEffect(() => {
    // This effect should only run once on mount
    const lastProjectId = localStorage.getItem(LAST_PROJECT_ID_KEY);
    if (lastProjectId && !projectFromStore) { // Only load if no project is in the store
      localProjectService.getProject(lastProjectId).then(projectData => {
        if (projectData) {
          loadProject(projectData);
        }

      });
    }
  }, []); // Empty dependency array ensures it runs only once


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

  const isFeatureEnabled = (featureId: string) => {
    if (!featuresLoaded) return false;
    const feature = features.find(f => f.id === featureId);
    return !!feature?.isEnabled;
  };

  const enabledTabs = [
    { id: 'files', enabled: true },
    { id: 'report', enabled: isFeatureEnabled('report') },
  ].filter(t => t.enabled).map(t => t.id);

  useEffect(() => {
    if (!enabledTabs.includes(activeTab) && enabledTabs.length > 0) {
      setActiveTab(enabledTabs[0]);
    } else if (enabledTabs.length === 0) {
      setActiveTab('');
    }
  }, [features, activeTab, enabledTabs]);

  const updateProjectName = useCallback((name: string) => {
    updateProject(p => { p.name = name; });
  }, [updateProject]);

  const updateProjectDescription = useCallback((description: string) => {
    updateProject(p => { p.projectDescription = description; });
  }, [updateProject]);

  return {
    activeTab,
    setActiveTab,
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    t,
    locale,
    project: projectFromStore,
    isLoadingProject: !projectFromStore && !!localStorage.getItem(LAST_PROJECT_ID_KEY), // Show loading if we expect a project
    enabledTabs,
    featuresLoaded,
    isFeatureEnabled,
    updateProjectName,
    updateProjectDescription
  };
}
