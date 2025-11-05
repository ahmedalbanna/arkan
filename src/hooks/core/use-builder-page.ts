
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useFeatures, useProject } from '@/hooks';

export function useBuilderPageLogic() {
  const { project, loadProject } = useBuilderStore();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const { t, locale } = useLocalization();
  const queryClient = useQueryClient();
  const { features, isLoaded: featuresLoaded } = useFeatures();

  const [activeTab, setActiveTab] = useState<string>('files');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasLoadedProject, setHasLoadedProject] = useState(false);

  const { data: projectData, isSuccess } = useProject(project?.id ?? '');

  useEffect(() => {
    if (userProfile && !userProfile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isSuccess && projectData && !hasLoadedProject) {
      loadProject(projectData);
      setHasLoadedProject(true);
    }
  }, [isSuccess, projectData, loadProject, hasLoadedProject]);

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

  return {
    activeTab,
    setActiveTab,
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    t,
    locale,
    project,
    projectData,
    enabledTabs,
    featuresLoaded,
    isFeatureEnabled,
  };
}
