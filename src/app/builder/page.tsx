
'use client';

import OnboardingGuide from '@/components/auth/OnboardingGuide';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { FileText, FolderKanban } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useBuilderStore, useInitializeBuilderStore } from '@/hooks/core/useBuilderStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';


function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[calc(100vh-300px)] w-full" />
    </div>
  );
}

const SessionActions = dynamic(() => import('@/components/project/SessionActions').then(mod => mod.SessionActions), {
  ssr: false,
  loading: () => <Skeleton className="h-8 w-[400px]" />,
});


const ReportGenerator = dynamic(() => import('@/components/report-mode/ReportModeGenerator'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

function GeneratePageContent() {
  const { userProfile, firebaseUser, refetchUser } = useAuth();
  const { project, updateProject } = useBuilderStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  // This hook ensures the store is initialized from localStorage on client-side mount
  const isStoreInitialized = useInitializeBuilderStore();
  
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hasCompletedOnboarding: true })
      });
      if (!response.ok) throw new Error('Failed to update onboarding status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser!.uid) });
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

  const updateProjectName = (name: string) => {
    updateProject(p => p.with({ name }));
  };

  // Show a loading skeleton until the store is initialized from local storage
  if (!isStoreInitialized) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative flex-grow flex flex-col">
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      <div className="flex-grow flex flex-col mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
          <div className="flex-1 space-y-2 overflow-auto">
            <Input
              className="text-xl font-semibold text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
              value={project?.name || ''}
              onChange={(e) => updateProjectName(e.target.value)}
              placeholder={'Untitled Project'}
            />
            {project?.updatedAt && (
              <p className="text-xs text-muted-foreground pt-1">
                Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
              </p>
            )}
          </div>
          <div className="flex-none">
            <SessionActions />
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <ReportGenerator />
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <GeneratePageContent />
  )
}
