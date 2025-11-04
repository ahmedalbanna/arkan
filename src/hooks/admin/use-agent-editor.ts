
'use client';

import { useUpdateAgent } from '@/hooks/data/useAgents';
import type { Agent, AgentCategoryDetails } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAgentCategories } from '@/hooks';
import { z } from 'zod';

export const agentKnowledgeSourceSchema = z.object({
  name: z.string(),
  type: z.enum(['file', 'text', 'web']),
  content: z.string(),
});

export const agentEditorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  category: z.string().optional(),
  prompt: z.string().min(10, "Prompt must be at least 10 characters").optional(),
  guidelines: z.array(z.string()).optional(),
  toolIds: z.array(z.string()).optional(),
  knowledge: z.array(agentKnowledgeSourceSchema).optional(),
  introduction: z.string().max(500).optional(),
  placeholder: z.string().optional(),
  conversationStarters: z.array(z.object({ value: z.string() })).optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
  model: z.string().optional(),
  isEnabled: z.boolean().optional(),
  icon: z.string().optional(),
});

export type AgentEditorFormValues = z.infer<typeof agentEditorSchema>;

interface UseAgentEditorProps {
  agentId: string;
  initialData: Agent;
}

export function useAgentEditor({ agentId, initialData }: UseAgentEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateAgentMutation = useUpdateAgent();
  const { data: categories } = useAgentCategories();

  const form = useForm<AgentEditorFormValues>({
    resolver: zodResolver(agentEditorSchema),
    defaultValues: {
      name: initialData.name,
      category: initialData.category,
      prompt: initialData.prompt,
      guidelines: initialData.guidelines || [],
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
    const decodedPrompt = promptFromUrl ? decodeURIComponent(promptFromUrl) : initialData.prompt;

    form.reset({
      ...form.getValues(), // Keep other form values
      name: initialData.name,
      category: initialData.category,
      prompt: decodedPrompt,
      guidelines: initialData.guidelines || [],
      toolIds: initialData.toolIds || [],
      knowledge: initialData.knowledge || [],
      introduction: initialData.introduction || '',
      placeholder: initialData.placeholder || 'Ask me anything...',
      conversationStarters: initialData.conversationStarters || [],
      tone: initialData.tone || 'Default',
      language: initialData.language || 'English (US)',
      model: initialData.model || 'googleai/gemini-2.0-flash',
    });
  }, [initialData, searchParams, form]);

  const handleSubmit = (data: AgentEditorFormValues) => {
    // The agentId is now passed directly in the props
    updateAgentMutation.mutate({ agentId, payload: data });
  };

  return {
    form,
    isPending: updateAgentMutation.isPending,
    handleSubmit,
    router,
    categories,
  };
}
