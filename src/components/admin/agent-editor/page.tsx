
'use client';

import AgentEditor from '@/components/admin/agent-editor/AgentEditor';
import { useLocalization } from '@/context/LocalizationContext';
import { AgentCategory } from '@/lib/types';
import { AlertCircle, Bot } from 'lucide-react';
import React from 'react';


export default function EditAgentPage({ params }: { params: { id: string } }) {
  const { t } = useLocalization();

  // In a real app, you would fetch the agent data based on params.id
  // For this example, we'll assume a structure but it won't have real data
  const agent = { id: params.id, name: "Loading Agent...", description: "...", prompt: "", isEnabled: true, category: AgentCategory.ContentGeneration, pageUrl: '/', icon: Bot };

  if (!agent) {
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
      <AgentEditor agentId={params.id} initialData={agent} />
    </div>
  );
}
