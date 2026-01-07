
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { CheckReadabilityToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(1, "Please enter some text to check."),
});

type FormValues = z.infer<typeof formSchema>;

export function useReadabilityChecker() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('checkReadability', {
        onSuccess: () => {
            toast({ title: 'Readability analysis complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof CheckReadabilityToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
