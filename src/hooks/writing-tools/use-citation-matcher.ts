
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { MatchCitationsToReferencesToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  documentText: z.string().min(1, "Please enter the document text."),
  references: z.string().min(1, "Please enter the reference list."),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).default('APA'),
});

type FormValues = z.infer<typeof formSchema>;

export function useCitationMatcher() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('matchCitationsToReferences', {
        onSuccess: () => {
            toast({ title: 'Citation matching complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { documentText: '', references: '', citationStyle: 'APA' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof MatchCitationsToReferencesToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
