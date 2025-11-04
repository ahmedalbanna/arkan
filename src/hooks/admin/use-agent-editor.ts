
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

export const agentGuidelineSchema = z.object({
  text: z.string().min(1, "Guideline text cannot be empty."),
  isDefault: z.boolean(),
});

export const agentPromptSchema = z.object({
  base: z.string().min(10, "Base prompt must be at least 10 characters."),
  guidelines: z.array(agentGuidelineSchema).optional(),
  jsonStructure: z.any().optional(),
  defaultContext: z.array(z.string()).optional(),
});

export const agentEditorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  category: z.string().optional(), // Changed to string for dynamic categories
  prompt: z.union([
    z.string().min(10, "Prompt must be at least 10 characters"),
    agentPromptSchema
  ]).optional(),
  introduction: z.string().max(500).optional(),
  placeholder: z.string().optional(),
  conversationStarters: z.array(z.object({ value: z.string() })).optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
  model: z.string().optional(),
  toolIds: z.array(z.string()).optional(),
  knowledge: z.array(agentKnowledgeSourceSchema).optional(),
  isEnabled: z.boolean().optional(),
  icon: z.string().optional(),
});

export type AgentEditorFormValues = z.infer<typeof agentEditorSchema>;

interface UseAgentEditorProps {
  agent: string;
  initialData: Agent;
}

export function useAgentEditor({ agent, initialData }: UseAgentEditorProps) {
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
    updateAgentMutation.mutate({ agent, payload: data });
  };

  return {
    form,
    isComplexPrompt: typeof form.watch('prompt') === 'object',
    isPending: updateAgentMutation.isPending,
    handleSubmit,
    router,
    categories,
  };
}
