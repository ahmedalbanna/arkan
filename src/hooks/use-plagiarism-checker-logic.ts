
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import type { PlagiarismCheckOutput } from '@/ai/schemas';

const plagiarismSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for a plagiarism check.'),
});

type PlagiarismFormValues = z.infer<typeof plagiarismSchema>;

export function usePlagiarismCheckerLogic() {
  const mutation = useWritingTool('/api/writing-tools/plagiarism-checker');
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PlagiarismFormValues>({
    resolver: zodResolver(plagiarismSchema),
    defaultValues: { text: '' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to process files.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = await firebaseUser.getIdToken();
        const result = await processFileApi(formData, token);
        form.setValue('text', result.markdown, { shouldValidate: true });
        toast({ title: "File Processed", description: `Text extracted from ${file.name}. You can now start the analysis.` });
        refetchUser();
    } catch (error: any) {
        toast({ title: "File Processing Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  }, [firebaseUser, form, refetchUser, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const onSubmit = async (data: PlagiarismFormValues) => {
    mutation.mutate({ text: data.text }, {
      onError: (error) => {
        toast({ title: 'Plagiarism Check Failed', description: error.message, variant: 'destructive' });
      }
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score < 25) return 'text-destructive';
    if (score < 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    getScoreColor,
    results: mutation.data as PlagiarismCheckOutput | undefined,
  };
}
