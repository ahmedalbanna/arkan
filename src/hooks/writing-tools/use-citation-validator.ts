
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { ValidateCitationsToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(1, "Please enter text with citations."),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
});

type FormValues = z.infer<typeof formSchema>;

export function useCitationValidator() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('validateCitations', {
        onSuccess: () => {
            toast({ title: 'Citation validation complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '', citationStyle: 'APA' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof ValidateCitationsToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
