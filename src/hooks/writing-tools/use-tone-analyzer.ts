
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { AnalyzeToneToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(1, "Please enter some text to check."),
  targetTone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useToneAnalyzer() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('analyzeTone', {
        onSuccess: () => {
            toast({ title: 'Tone analysis complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '', targetTone: 'professional' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof AnalyzeToneToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
