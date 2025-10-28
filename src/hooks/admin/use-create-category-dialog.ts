
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAgentCategory } from '@/hooks/data/useAgents';
import { toast } from '@/hooks/util/use-toast';

const categorySchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters long.").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function useCreateCategoryDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: '',
      name: '',
    },
  });

  const mutation = useCreateAgentCategory({
    onSuccess: () => {
        toast({ title: "Category Created", description: "The new agent category has been added."});
        setIsOpen(false);
        form.reset();
    },
    onError: (error: any) => {
        toast({ title: "Creation Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
    }
  });

  const onSubmit = (data: CategoryFormValues) => {
    mutation.mutate(data);
  };

  return {
    isOpen,
    setIsOpen,
    form,
    onSubmit,
    mutation,
  };
}
