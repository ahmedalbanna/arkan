
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { CheckReferencesToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  references: z.string().min(1, "Please enter a reference list to check."),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
});

type FormValues = z.infer<typeof formSchema>;

export function useReferenceChecker() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('checkReferences', {
        onSuccess: () => {
            toast({ title: 'Reference check complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { references: '', citationStyle: 'APA' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof CheckReferencesToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
