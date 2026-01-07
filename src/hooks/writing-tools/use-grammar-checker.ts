
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { CheckGrammarToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(1, "Please enter some text to check."),
});

type FormValues = z.infer<typeof formSchema>;

export function useGrammarChecker() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('checkGrammar', {
        onSuccess: () => {
            toast({ title: 'Grammar check complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate({ text: data.text, language: 'en' });
    };

    const results = mutation.data as z.infer<typeof CheckGrammarToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
