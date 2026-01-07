
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { AnalyzeDocumentStructureToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(50, "Please enter at least 50 characters to analyze."),
  documentType: z.enum(['academic', 'business', 'technical', 'creative', 'general']).default('general'),
});

type FormValues = z.infer<typeof formSchema>;

export function useDocumentStructureAnalyzer() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('analyzeDocumentStructure', {
        onSuccess: () => {
            toast({ title: 'Document structure analysis complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: '', documentType: 'general' },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof AnalyzeDocumentStructureToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
