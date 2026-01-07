
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { AcademicLiteratureReviewInputSchema, AcademicLiteratureReviewOutputSchema } from '@/ai/tools/schemas';

export function useAcademicLiteratureReview() {
    const { toast } = useToast();

    const mutation = useWritingTool('academicLiteratureReview', {
        onSuccess: () => {
            toast({ title: 'Literature review generated successfully!' });
        },
    });

    const form = useForm<z.infer<typeof AcademicLiteratureReviewInputSchema>>({
        resolver: zodResolver(AcademicLiteratureReviewInputSchema),
        defaultValues: {
            topic: '',
            keywords: [],
            citationStyle: 'APA',
            focusAreas: [],
            minLength: 800,
            includeGaps: true,
        },
    });

    const onSubmit = (data: z.infer<typeof AcademicLiteratureReviewInputSchema>) => {
        // Keywords and focusAreas might be strings from the input, convert to arrays
        const payload = {
            ...data,
            keywords: typeof data.keywords === 'string' ? (data.keywords as string).split(',').map(k => k.trim()).filter(Boolean) : data.keywords,
            focusAreas: typeof data.focusAreas === 'string' ? (data.focusAreas as string).split(',').map(k => k.trim()).filter(Boolean) : data.focusAreas,
        };
        mutation.mutate(payload as any);
    };

    const results = mutation.data as z.infer<typeof AcademicLiteratureReviewOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
