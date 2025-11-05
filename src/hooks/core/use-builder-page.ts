'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useFeatures, useProject } from '@/hooks';

export function useBuilderPageLogic() {
  const { project: projectFromStore, loadProject, updateProject } = useBuilderStore();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const { t, locale } = useLocalization();
  const queryClient = useQueryClient();
  const { features, isLoaded: featuresLoaded } = useFeatures();

  const [activeTab, setActiveTab] = useState<string>('files');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(projectFromStore?.id);

  // When the project in the global store changes (e.g., loaded from a file), update our active ID
  useEffect(() => {
    if (projectFromStore?.id !== activeProjectId) {
      setActiveProjectId(projectFromStore?.id);
    }
  }, [projectFromStore, activeProjectId]);

  // useProject hook now fetches based on the activeProjectId
  const { data: projectFromServer, isLoading: isLoadingProject, isSuccess } = useProject(activeProjectId);
  
  // When data is successfully fetched from the server, load it into the store.
  useEffect(() => {
    if (isSuccess && projectFromServer) {
      // Avoid re-loading if the store already has this version
      if (projectFromStore?.updatedAt !== projectFromServer.updatedAt) {
          loadProject(projectFromServer.toStateObject());
      }
    }
  }, [isSuccess, projectFromServer, loadProject, projectFromStore?.updatedAt]);
  
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
    isLoadingProject,
    enabledTabs,
    featuresLoaded,
    isFeatureEnabled,
    updateProjectName,
    updateProjectDescription
  };
}
