'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAgentCategory } from '@/hooks/use-agents';

const createCategorySchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
});
export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export function useCreateCategoryDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const createCategoryMutation = useCreateAgentCategory();

    const form = useForm<CreateCategoryFormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: { id: '', name: '' },
    });

    const onSubmit = (data: CreateCategoryFormValues) => {
        createCategoryMutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                if(error.errors) {
                    for(const key in error.errors) {
                        form.setError(key as any, { message: error.errors[key][0] });
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
        mutation: createCategoryMutation,
    };
}
