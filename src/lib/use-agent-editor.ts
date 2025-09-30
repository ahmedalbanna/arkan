'use client';

import { useUpdateAgent } from '@/hooks';
import { agentEditorSchema, type AgentEditorFormValues } from '@/lib/agent-editor-schema';
import type { Agent } from '@/lib/models/agent';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface UseAgentEditorProps {
  agentId: string;
  initialData: Agent;
}

export function useAgentEditor({ agentId, initialData }: UseAgentEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateAgentMutation = useUpdateAgent();

  const form = useForm<AgentEditorFormValues>({
    resolver: zodResolver(agentEditorSchema),
    defaultValues: {
      name: initialData.name,
      category: initialData.category,
      prompt: initialData.prompt,
      toolIds: initialData.toolIds || [],
      knowledge: initialData.knowledge || [],
      introduction: initialData.introduction || '',
      placeholder: initialData.placeholder || 'Ask me anything...',
      conversationStarters: initialData.conversationStarters || [],
      tone: initialData.tone || 'Default',
      language: initialData.language || 'English (US)',
      model: initialData.model || 'googleai/gemini-2.0-flash',
    },
  });

  useEffect(() => {
    const promptFromUrl = searchParams.get('prompt');

    const getInitialPrompt = () => {
      if (typeof initialData.prompt === 'string') {
        return promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt;
      }
      if (typeof initialData.prompt === 'object') {
        const newBase = promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt.base;
        return { ...initialData.prompt, base: newBase };
      }
      return '';
    };

    form.reset({ ...form.getValues(), prompt: getInitialPrompt() });
  }, [initialData, searchParams, form]);

  const handleSubmit = (data: AgentEditorFormValues) => {
    updateAgentMutation.mutate({ agentId, payload: data });
  };

  return {
    form,
    isComplexPrompt: typeof form.watch('prompt') === 'object',
    isPending: updateAgentMutation.isPending,
    handleSubmit,
    router,
  };
}
