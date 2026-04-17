'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks';
import { type TocSection } from '@/modules/ai-content/domain/entities/TOC';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiService } from '@/infrastructure/api/ApiService';

const GenerateTocOutputSchema = z.object({
  tableOfContents: z.array(
    z.object({
      title: z.string(),
      sections: z.array(z.string()),
    })
  ),
});

const formSchema = z.object({
  projectDescription: z.string().min(10, 'Project description is required.'),
  additionalInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const formatTocToMarkdown = (toc: TocSection[]): string => {
  return toc
    .map((chapter) => `# ${chapter.title}\n${chapter.sections.map((section) => `  - ${section}`).join('\n')}`)
    .join('\n\n');
};

export function useGenerateTocLogic() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: FormValues): Promise<z.infer<typeof GenerateTocOutputSchema>> => {
      const response = await apiService<FormValues, unknown>({
        endpoint: '/api/writing-tools/generate-toc',
        method: 'POST',
        data,
      });

      const parsed = GenerateTocOutputSchema.safeParse(response);
      if (parsed.success) {
        return parsed.data;
      }

      throw new Error('Failed to generate Table of Contents');
    },
    onSuccess: () => {
      toast({ title: 'Table of Contents generated successfully!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error generating TOC',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDescription: '',
      additionalInstructions: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data;
  const generatedMarkdown = useMemo(
    () => (results ? formatTocToMarkdown(results.tableOfContents) : ''),
    [results]
  );

  return {
    form,
    mutation,
    onSubmit,
    results,
    generatedMarkdown,
  };
}
