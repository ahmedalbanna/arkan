
'use client';

import AgentEditor from '@/components/admin/agent-editor/AgentEditor';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgent } from '@/hooks/use-agents';
import { AlertCircle, Bot, Loader2 } from 'lucide-react';
import React from 'react';


export default function EditAgentPage({ params }: { params: { id: string } }) {
  const { t } = useLocalization();

  // Fetch the agent data using the hook
  const { data: agent, isLoading, isError } = useAgent(params.id);

  if (isLoading) {
    return (
        <div className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p>Loading agent...</p>
        </div>
    );
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
            <Bot className="h-6 w-6" />
            {t('agentEditor.pageTitle')}
        </h1>
      </div>
      {/* The `agent` object from `useQuery` is stable */}
      <AgentEditor agentId={params.id} initialData={agent} />
    </div>
  );
}
