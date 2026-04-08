'use client';

import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'arkan_onboarding_completed';

/**
 * Hook to manage the onboarding flow visibility and completion status.
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  return {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
  };
}
