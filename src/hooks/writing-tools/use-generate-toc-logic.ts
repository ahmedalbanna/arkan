
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks';
import { GenerateTocOutputSchema } from '@/ai/schemas';
import type { TocSection } from '@/lib/models';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSession } from "next-auth/react";
import { writingToolApi } from '@/services/api/writingToolsService';

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
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: async (data: FormValues): Promise<z.infer<typeof GenerateTocOutputSchema>> => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      const token = session.user.id;
      
      return writingToolApi<any, z.infer<typeof GenerateTocOutputSchema>>(
        '/api/writing-tools/generate-toc',
        {
          data: {
            flow: 'generate-toc',
            projectDescription: data.projectDescription,
            additionalInstructions: data.additionalInstructions,
          },
          token
        }
      );
    },
    onSuccess: () => {
        toast({ title: "Table of Contents generated successfully!" });
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
