
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import type { FactCheckOutput } from '@/ai/schemas';

const factCheckerSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for a thorough fact-check.'),
});

type FactCheckerFormValues = z.infer<typeof factCheckerSchema>;

export function useFactCheckerLogic() {
  const mutation = useWritingTool('/api/writing-tools/fact-checker');
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FactCheckerFormValues>({
    resolver: zodResolver(factCheckerSchema),
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

  const onSubmit = async (data: FactCheckerFormValues) => {
    mutation.mutate({ text: data.text }, {
      onError: (error) => {
        toast({ title: 'Fact-Check Failed', description: error.message, variant: 'destructive' });
      }
    });
  };

  return {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results: mutation.data as FactCheckOutput | undefined,
  };
}
