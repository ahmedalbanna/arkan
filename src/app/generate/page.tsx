
'use client';

import { useState, useEffect } from 'react';
import { FileText, Laptop, Presentation, FilePlus2, GitGraph } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionActions } from '@/components/SessionActions';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import OnboardingGuide from '@/components/OnboardingGuide';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAgents } from '@/hooks/use-agents';
import type { Agent } from '@/lib/agents';

const LoadingSkeleton = () => (
  <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[calc(100vh-300px)] w-full" />
  </div>
);


const ProposalModeGenerator = dynamic(() => import('@/components/proposal-generator/ProposalModeGenerator').then(mod => mod.ProposalModeGenerator), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const ReportGenerator = dynamic(() => import('@/components/report-generator/ReportModeGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const DiagramGenerator = dynamic(() => import('@/components/diagram-generator/DiagramGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const CodeGenerator = dynamic(() => import('@/components/code-generator/CodeGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const PresentationGenerator = dynamic(() => import('@/components/presentation-generator/PresentationGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});


async function markOnboardingComplete(userId: string, token: string) {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hasCompletedOnboarding: true })
    });
    if (!response.ok) {
        throw new Error('Failed to update onboarding status');
    }
    return response.json();
}

// Map tabs to their primary controlling agent ID
const tabAgentMap = {
    proposal: 'generate-proposal-report',
    report: 'generate-introduction-section', // If this is enabled, the section is likely enabled
    diagram: 'generate-use-case-diagram', // Check one of the diagram agents
    code: 'generate-code',
    presentation: 'generate-presentation',
};


function GeneratePageContent() {
  const [activeTab, setActiveTab] = useState("proposal");
  const proposal = useBuilderStore(s => s.proposal);
  const { t } = useLocalization();
  const { firebaseUser, userProfile, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const { agents, isLoaded: agentsLoaded } = useAgents();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show the onboarding guide if the user profile is loaded and the flag is false
    if (userProfile && !userProfile.hasCompletedOnboarding) {
        setShowOnboarding(true);
    }
  }, [userProfile]);


  const onboardingMutation = useMutation({
    mutationFn: async () => {
        if (!firebaseUser) throw new Error("User not authenticated");
        const token = await firebaseUser.getIdToken();
        return markOnboardingComplete(firebaseUser.uid, token);
    },
    onSuccess: () => {
        // Invalidate user query to refetch the updated profile
        queryClient.invalidateQueries({ queryKey: ['user', firebaseUser?.uid] });
        refetchUser();
    },
    onError: (error: Error) => {
        console.error("Failed to mark onboarding as complete:", error);
    }
  });


  const handleOnboardingComplete = () => {
      setShowOnboarding(false);
      if (userProfile && !userProfile.hasCompletedOnboarding) {
        onboardingMutation.mutate();
      }
  };

  const isAgentEnabled = (agentId: string) => {
      if (!agentsLoaded) return false; // Default to not enabled while loading
      const agent = agents.find(a => a.id === agentId);
      return agent?.isEnabled ?? false;
  };
  
  const enabledTabs = Object.keys(tabAgentMap).filter(tabKey => isAgentEnabled(tabAgentMap[tabKey as keyof typeof tabAgentMap]));
  
  // If the current active tab is no longer enabled, switch to the first available one
  useEffect(() => {
    if (!enabledTabs.includes(activeTab) && enabledTabs.length > 0) {
      setActiveTab(enabledTabs[0]);
    } else if (enabledTabs.length === 0) {
      setActiveTab(''); // No tabs are active
    }
  }, [enabledTabs, activeTab]);

  return (
    <>
      <OnboardingGuide isOpen={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />
      <div className="container h-full mx-auto max-w-screen-2xl px-4 py-8 flex flex-col">
        <div className="flex justify-end items-center mb-4">
          <SessionActions />
        </div>
        <div className="flex flex-col flex-grow">
            {!agentsLoaded ? (
                <LoadingSkeleton />
            ) : (
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.max(1, enabledTabs.length)}, 1fr)` }}>
                        {isAgentEnabled(tabAgentMap.proposal) && (
                            <TabsTrigger value="proposal" className="gap-2">
                                <FilePlus2 className="h-4 w-4" /> {t('builder.tabs.proposal')}
                            </TabsTrigger>
                        )}
                        {isAgentEnabled(tabAgentMap.report) && (
                            <TabsTrigger value="report" className="gap-2" disabled={!proposal}>
                                <FileText className="h-4 w-4" /> {t('builder.tabs.document')}
                            </TabsTrigger>
                        )}
                        {isAgentEnabled(tabAgentMap.diagram) && (
                            <TabsTrigger value="diagram" className="gap-2" disabled={!proposal}>
                                <GitGraph className="h-4 w-4" /> {t('builder.tabs.diagram')}
                            </TabsTrigger>
                        )}
                        {isAgentEnabled(tabAgentMap.code) && (
                            <TabsTrigger value="code" className="gap-2">
                                <Laptop className="h-4 w-4" /> {t('builder.tabs.code')}
                            </TabsTrigger>
                        )}
                        {isAgentEnabled(tabAgentMap.presentation) && (
                             <TabsTrigger value="presentation" className="gap-2" disabled={!proposal}>
                                <Presentation className="h-4 w-4" /> {t('builder.tabs.presentation')}
                            </TabsTrigger>
                        )}
                    </TabsList>
                    
                    <div className="w-full flex-grow">
                        <TabsContent value="proposal" className="h-full">
                        {activeTab === 'proposal' && <ProposalModeGenerator />}
                        </TabsContent>
                        <TabsContent value="report" className="h-full">
                        {activeTab === 'report' && <ReportGenerator />}
                        </TabsContent>
                        <TabsContent value="diagram" className="h-full">
                        {activeTab === 'diagram' && <DiagramGenerator />}
                        </TabsContent>
                        <TabsContent value="code" className="h-full">
                        {activeTab === 'code' && <CodeGenerator />}
                        </TabsContent>
                        <TabsContent value="presentation" className="h-full">
                        {activeTab === 'presentation' && <PresentationGenerator />}
                        </TabsContent>
                    </div>
                 </Tabs>
            )}
        </div>
      </div>
    </>
  );
}

export default function GeneratePage() {
    return (
        <GeneratePageContent />
    )
}
