
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAgent, useAgentCategories } from '@/hooks/data/use-agents';
import { AgentPromptSchema } from '@/ai/schemas';

const CreateAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required."),
  pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
  prompt: z.union([z.string(), AgentPromptSchema]),
  icon: z.string().optional(),
});

type CreateAgentFormValues = z.infer<typeof CreateAgentSchema>;

export function useCreateAgentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories } = useAgentCategories();

  const form = useForm<CreateAgentFormValues>({
    resolver: zodResolver(CreateAgentSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      category: '',
      pageUrl: '/admin/chats',
      prompt: 'You are a helpful assistant.',
      icon: 'Bot',
    },
  });

  const mutation = useCreateAgent({
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
    }
  });

  const onSubmit = (data: CreateAgentFormValues) => {
    mutation.mutate(data);
  };

  return {
    isOpen,
    setIsOpen,
    form,
    onSubmit,
    mutation,
    categories
  };
}
