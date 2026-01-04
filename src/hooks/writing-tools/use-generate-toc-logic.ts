
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast, useBuilderStore } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { GenerateTocOutputSchema, GenerateTocInputSchema } from '@/ai/schemas';
import type { TocSection } from '@/lib/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FormValues): Promise<z.infer<typeof GenerateTocOutputSchema>> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Hardcoded response for testing
      const hardcodedData: z.infer<typeof GenerateTocOutputSchema> = {
        tableOfContents: [
          {
            title: "Chapter 1: Introduction (Sample)",
            sections: ["1.1 Problem Statement", "1.2 Project Objectives", "1.3 Scope of Work"],
          },
          {
            title: "Chapter 2: System Analysis (Sample)",
            sections: ["2.1 Functional Requirements", "2.2 Non-Functional Requirements", "2.3 User Stories"],
          },
          {
            title: "Chapter 3: Conclusion (Sample)",
            sections: ["3.1 Final Summary", "3.2 Future Work"],
          },
        ],
      };
      
      console.log("Using hardcoded TOC data for testing:", hardcodedData);
      return hardcodedData;
    },
    onSuccess: (data) => {
        const tocData = data.tableOfContents;
        if (tocData) {
            const markdown = formatTocToMarkdown(tocData);
            updateProject(p => { 
                if(p) p.tableOfContentsMarkdown = markdown; 
            });
            toast({ title: "Sample Table of Contents generated!" });
        }
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
