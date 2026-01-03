
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast, useBuilderStore } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { GenerateTocOutputSchema, GenerateTocInputSchema } from '@/ai/schemas';
import type { TocSection } from '@/lib/models';

type FormValues = z.infer<typeof GenerateTocInputSchema>;

const formatTocToMarkdown = (toc: TocSection[]): string => {
    return toc.map(chapter => 
        `# ${chapter.title}\n${chapter.sections.map(section => `  - ${section}`).join('\n')}`
    ).join('\n\n');
};


export function useGenerateTocLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { updateProject } = useBuilderStore();

  const mutation = useWritingTool('/api/writing-tools/generate-toc', {
    onSuccess: (data: any) => {
        const tocData = (data as z.infer<typeof GenerateTocOutputSchema>).tableOfContents;
        if (tocData) {
            const markdown = formatTocToMarkdown(tocData);
            updateProject(p => { p.tableOfContentsMarkdown = markdown; });
            toast({ title: "Table of Contents generated successfully!" });
        }
    },
    onError: (error) => {
      toast({
        title: 'Error generating TOC',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateTocInputSchema),
    defaultValues: {
      projectDescription: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return {
    t,
    form,
    mutation,
    onSubmit,
    results: mutation.data as z.infer<typeof GenerateTocOutputSchema> | null,
  };
}
