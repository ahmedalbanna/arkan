
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { ProfessionalDocumentWriterInputSchema, ProfessionalDocumentWriterOutputSchema } from '@/ai/tools/schemas';

export function useProfessionalDocumentWriter() {
    const { toast } = useToast();
    
    const mutation = useWritingTool('professionalDocumentWriter', {
        onSuccess: () => {
            toast({ title: 'Document generated successfully!' });
        },
    });

    const form = useForm<z.infer<typeof ProfessionalDocumentWriterInputSchema>>({
        resolver: zodResolver(ProfessionalDocumentWriterInputSchema),
        defaultValues: {
            documentType: 'business_report',
            topic: '',
            purpose: '',
            targetAudience: '',
            keyPoints: [],
            tone: 'professional',
            length: 'medium',
            includeExecutiveSummary: true,
            includeRecommendations: true,
            additionalContext: '',
        },
    });

    const onSubmit = (data: z.infer<typeof ProfessionalDocumentWriterInputSchema>) => {
         const payload = {
            ...data,
            keyPoints: typeof data.keyPoints === 'string' ? (data.keyPoints as string).split('\n').map(k => k.trim()).filter(Boolean) : data.keyPoints,
        };
        mutation.mutate(payload as any);
    };

    const results = mutation.data as z.infer<typeof ProfessionalDocumentWriterOutputSchema> | null;

    return {
        form,
        mutation,
        onSubmit,
        results,
    }
}
