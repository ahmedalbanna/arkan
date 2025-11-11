
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import type { SentenceStructureCheckOutput } from '@/ai/schemas';

const sentenceStructureSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type FormValues = z.infer<typeof sentenceStructureSchema>;

export function useSentenceStructureCheckerLogic() {
  const [isUploading, setIsUploading] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to process files.', variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = await firebaseUser.getIdToken();
      const result = await processFileApi(formData, token);
      form.setValue('text', result.markdown, { shouldValidate: true });
      toast({ title: 'File Processed', description: `Text extracted from ${file.name}.` });
      refetchUser();
    } catch (error: any) {
      toast({ title: 'File Processing Failed', description: error.message, variant: "destructive" });
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
