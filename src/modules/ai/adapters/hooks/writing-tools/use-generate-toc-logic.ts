
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast, useBuilderStore } from '@/hooks';
import { GenerateTocOutputSchema } from '@/ai/schemas';
import type { TocSection } from '@/lib/types';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

// Updated schema to include the optional additional instructions
const formSchema = z.object({
  projectDescription: z.string().min(10, 'Project description is required.'),
  additionalInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const formatTocToMarkdown = (toc: TocSection[]): string => {
    return toc.map(chapter => 
        `# ${chapter.title}\n${chapter.sections.map(section => `  - ${section}`).join('\n')}`
    ).join('\n\n');
};

export function useGenerateTocLogic() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: FormValues): Promise<z.infer<typeof GenerateTocOutputSchema>> => {
      // Hardcoded response for testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      console.log("Generating TOC with data:", data); // For debugging

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
      
      return hardcodedData;
    },
    onSuccess: () => {
        toast({ title: "Sample Table of Contents generated!" });
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
  const generatedMarkdown = useMemo(() => (results ? formatTocToMarkdown(results.tableOfContents) : ''), [results]);

  return {
    form,
    mutation,
    onSubmit,
    results,
    generatedMarkdown,
  };
}
