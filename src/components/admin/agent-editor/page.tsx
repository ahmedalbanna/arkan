
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useAgent, useAgents } from '@/hooks';
import { AlertCircle, Bot, Loader2 } from 'lucide-react';
import React, { Suspense, lazy } from 'react';

const AgentEditor = lazy(() => import('@/components/admin/agent-editor/AgentEditor'));

function AgentEditorSkeleton() {
  return (
    <div className="p-8 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
      <p>Loading agent editor...</p>
    </div>
  );
}


export default function EditAgentPage({ params }: { params: { id: string } }) {
  const { t } = useLocalization();

  // Fetch the agent data using the hook
  const { data: agent, isLoading: agentLoading, isError: agentError } = useAgent(params.id);
  const { agents: allAgents, isLoaded: agentsLoaded, isError: agentsError } = useAgents();


  const isLoading = agentLoading || !agentsLoaded;
  const isError = agentError || agentsError;

  if (isLoading) {
    return <AgentEditorSkeleton />;
  }

  if (isError || !agent) {
    return (
        <div className="p-8 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>{t('agentEditor.errorLoading')}</p>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
            
            {t('agentEditor.pageTitle')}
        </h1>
      </div>
      <Suspense fallback={<AgentEditorSkeleton />}>
        <AgentEditor agentId={params.id} initialData={agent} allAgents={allAgents || []} />
      </Suspense>
    </div>
  );
}
