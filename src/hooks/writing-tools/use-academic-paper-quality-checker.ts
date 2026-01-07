
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { AcademicPaperQualityCheckerInputSchema, AcademicPaperQualityCheckerOutputSchema } from '@/ai/tools/schemas';

export function useAcademicPaperQualityChecker() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('academicPaperQualityChecker', {
        onSuccess: () => {
            toast({ title: 'Paper quality check complete.' });
        },
    });

    const form = useForm<z.infer<typeof AcademicPaperQualityCheckerInputSchema>>({
        resolver: zodResolver(AcademicPaperQualityCheckerInputSchema),
        defaultValues: {
            documentText: '',
            references: '',
            citationStyle: 'APA',
            documentType: 'research_paper',
            checkGrammar: true,
            checkCitations: true,
            checkStructure: true,
            checkReadability: true,
        },
    });

    const onSubmit = (data: z.infer<typeof AcademicPaperQualityCheckerInputSchema>) => {
        mutation.mutate(data as any);
    };

    const results = mutation.data as z.infer<typeof AcademicPaperQualityCheckerOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
