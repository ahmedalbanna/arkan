
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { ImproveWordChoiceToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(1, "Please enter some text to improve."),
  style: z.enum(['concise', 'formal', 'vivid', 'simple']).default('concise'),
});

type FormValues = z.infer<typeof formSchema>;

export function useWordChoiceImprover() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('improveWordChoice', {
        onSuccess: () => {
            toast({ title: 'Word choice analysis complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '', style: 'concise' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof ImproveWordChoiceToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
