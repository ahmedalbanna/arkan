
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services';
import { useDropzone } from 'react-dropzone';
import type { GrammarCheckOutput } from '@/ai/schemas';

const grammarSchema = z.object({
  text: z.string().min(5, 'Text must be at least 5 characters to check.'),
});

type GrammarFormValues = z.infer<typeof grammarSchema>;

export function useGrammarCheckerLogic() {
  const [isCopied, setIsCopied] = useState(false);
  const mutation = useWritingTool('/api/writing-tools/grammar-checker');
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GrammarFormValues>({
    resolver: zodResolver(grammarSchema),
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

  const onSubmit = (data: GrammarFormValues) => {
    mutation.mutate({ text: data.text }, {
      onSuccess: () => {
        toast({ title: 'Grammar check successful!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const results = mutation.data as GrammarCheckOutput | undefined;

  const handleCopy = () => {
    if (!results?.correctedText) return;
    navigator.clipboard.writeText(results.correctedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
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
    results,
    isCopied,
    handleCopy,
  };
}
