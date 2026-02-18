
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useDropzone } from 'react-dropzone';
import { useSession } from "next-auth/react";
import { useAuth } from '@/context/NextAuthContext';
import { processFileApi } from '@/services';
import type { BiasCheckOutput } from '@/ai/schemas';

const biasCheckSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for an accurate analysis.'),
});

type BiasCheckFormValues = z.infer<typeof biasCheckSchema>;

export function useBiasCheckerLogic() {
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession(); const { refetchUser } = useAuth();
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/bias-checker', {
    onError: (error) => {
      toast({ title: 'Bias Check Failed', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<BiasCheckFormValues>({
    resolver: zodResolver(biasCheckSchema),
    defaultValues: { text: '' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!session?.user?.id) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to process files.', variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = session.user.id;
      const result = await processFileApi(formData, token);
      form.setValue('text', result.markdown, { shouldValidate: true });
      toast({ title: 'File Processed', description: `Text extracted from ${file.name}.` });
      refetchUser();
    } catch (error: any) {
      toast({ title: 'File Processing Failed', description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [session?.user?.id, form, refetchUser, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const onSubmit = (data: BiasCheckFormValues) => {
    mutation.mutate(data);
  };

  const results = mutation.data as BiasCheckOutput | null;

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
