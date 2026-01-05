
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgentCategoriesAction, createAgentCategoryAction } from '@/app/actions/agentActions';
import { toast } from '@/hooks/util/use-toast';
import { z } from 'zod';

const CreateCategorySchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
});

type CreateCategoryData = z.infer<typeof CreateCategorySchema>;

export function useAgentCategories() {
    const { data, ...rest } = useQuery({
        queryKey: ['agent-categories'],
        queryFn: getAgentCategoriesAction,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    return { categories: data || [], ...rest };
}

export function useCreateAgentCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoryData) => createAgentCategoryAction(data),
        onSuccess: () => {
            toast({ title: "Category Created", description: "The new agent category has been added." });
            queryClient.invalidateQueries({ queryKey: ['agent-categories'] });
        },
        onError: (error: Error) => {
            toast({ title: "Creation Failed", description: error.message, variant: "destructive" });
        }
    });
}
