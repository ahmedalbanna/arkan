'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useDropzone } from 'react-dropzone';
import type { SentenceStructureCheckOutput } from '@/modules/ai/domain/schemas';

const sentenceStructureSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type FormValues = z.infer<typeof sentenceStructureSchema>;

export function useSentenceStructureCheckerLogic() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/sentence-structure-checker', {
    onError: (error) => {
      toast({ title: 'Structure Check Failed', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(sentenceStructureSchema),
    defaultValues: { text: '' },
  });

  const onFileUpload = useCallback((content: string) => {
    form.setValue('text', content, { shouldValidate: true });
    toast({ title: 'File Processed', description: 'Text from file has been loaded.' });
  }, [form, toast]);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            onFileUpload(result);
            setIsUploading(false);
        };
        reader.onerror = () => {
            throw new Error("Error reading file.");
        };

        const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.md');
        if (isTextFile) {
            reader.readAsText(file);
        } else {
             // For other file types like PDF, you might need a different processing step
             // For now, we'll assume text-based for this tool.
             toast({ title: 'Unsupported File', description: 'Please upload a text-based file (.txt, .md).', variant: 'destructive' });
             setIsUploading(false);
        }
    } catch (error: any) {
      toast({ title: 'File Processing Failed', description: error.message, variant: "destructive" });
      setIsUploading(false);
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as SentenceStructureCheckOutput | null;

  return {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
  };
}
