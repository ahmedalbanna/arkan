
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { AnalyzeDocumentQualityToolOutputSchema } from '@/ai/tools';

const formSchema = z.object({
  text: z.string().min(100, "Please enter at least 100 characters for a comprehensive analysis."),
  documentType: z.enum(['academic', 'business', 'technical', 'creative', 'general']).default('general'),
  checkGrammar: z.boolean().default(true),
  checkStructure: z.boolean().default(true),
  checkCitations: z.boolean().default(false),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useDocumentQualityAnalyzer() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('analyzeDocumentQuality', {
        onSuccess: () => {
            toast({ title: 'Document quality analysis complete.' });
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: '',
            documentType: 'general',
            checkGrammar: true,
            checkStructure: true,
            checkCitations: false,
            citationStyle: 'APA',
        },
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const results = mutation.data as z.infer<typeof AnalyzeDocumentQualityToolOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
