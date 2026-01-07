
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { AnalyzeArgumentStructureToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(50, "Please enter at least 50 characters to analyze."),
});

type FormValues = z.infer<typeof formSchema>;

export function useArgumentStructureAnalyzer() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('analyzeArgumentStructure', {
        onSuccess: () => {
            toast({ title: 'Argument analysis complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof AnalyzeArgumentStructureToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
