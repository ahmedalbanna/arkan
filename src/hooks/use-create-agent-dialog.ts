'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAgent, useAgentCategories } from '@/hooks';

const createAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required."),
  pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  icon: z.string().optional(),
});

export type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

export function useCreateAgentDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const createAgentMutation = useCreateAgent();
    const { data: categories } = useAgentCategories();

    const form = useForm<CreateAgentFormValues>({
        resolver: zodResolver(createAgentSchema),
        defaultValues: { id: '', name: '', description: '', category: 'content-generation', pageUrl: '/', prompt: '', icon: '' },
    });

    const onSubmit = (data: CreateAgentFormValues) => {
        createAgentMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if (error.errors) {
                    for (const key in error.errors) {
                        form.setError(key as keyof CreateAgentFormValues, { message: error.errors[key][0] });
                    }
                }
            }
        });
    };

    return {
        isOpen,
        setIsOpen,
        form,
        onSubmit,
        mutation: createAgentMutation,
        categories,
    };
}
