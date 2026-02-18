'use client';

import { User } from '@/lib/models';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';

interface WelcomeBannerProps {
  userProfile: User | null;
  onDismiss?: () => void;
}

export function WelcomeBanner({ userProfile, onDismiss }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { t } = useLocalization();

  useEffect(() => {
    if (userProfile && typeof window !== 'undefined') {
      const lastVisitKey = `last_visit_${userProfile.id}`;
      const lastVisit = localStorage.getItem(lastVisitKey);
      
      // Show banner only on first visit or after a week
      if (!lastVisit) {
        setIsFirstVisit(true);
        setIsVisible(true);
        localStorage.setItem(lastVisitKey, new Date().toISOString());
      } else {
        const lastVisitDate = new Date(lastVisit);
        const daysSinceLastVisit = (new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastVisit > 7) {
          setIsVisible(true);
          localStorage.setItem(lastVisitKey, new Date().toISOString());
        }
      }
    }
  }, [userProfile]);

  if (!isVisible || !userProfile) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
          {getGreeting()}, <span className="text-primary">{userProfile.name?.split(' ')[0]}</span>!
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isFirstVisit
            ? "Welcome to Arkan! Get started by exploring our writing tools and features."
            : `You have ${userProfile.credits || 0} credits available. Ready to create something amazing?`}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="h-8 w-8 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
