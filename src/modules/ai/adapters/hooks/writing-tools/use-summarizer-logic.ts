'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { DocumentProcessingApiClient } from '@/modules/ai-content/adapters/api-client/DocumentProcessingApiClient';
import { container } from '@/infrastructure/di/container';
import { useDropzone } from 'react-dropzone';
import { useLocalization } from '@/context/LocalizationContext';

/**
 * useSummarizerLogic — High-fidelity state orchestration for text synthesis.
 * Bridges the Summarizer UI with the underlying neural infrastructure and file processing nodes.
 * 
 * DEFENSIVE MEASURES:
 * 1. Neural Buffer: Ref-based guard to prevent concurrent submissions.
 * 2. Result Vectoring: Standardized success/failure handlers for AI operations.
 * 3. Existence Guards: Validates identity node and text payloads before transmission.
 * 4. Purity: Enforces strict schema constraints on density and volume.
 */

const summarizerSchema = z.object({
  text: z.string().min(20, 'Please enter at least 20 characters to synthesize a valid summary.'),
  length: z.enum(['short', 'medium', 'long']),
});

type SummarizerFormValues = z.infer<typeof summarizerSchema>;

export function useSummarizerLogic() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { userProfile: user, refetchUser } = useAuth();
  
  const [summarizedText, setSummarizedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 1. NEURAL BUFFER — Guard against rapid multi-submission
  const submissionBuffer = useRef<boolean>(false);

  const summarizeMutation = useWritingTool<string, SummarizerFormValues>('summarize', {
    onSuccess: (data: string) => {
      submissionBuffer.current = false;
      setSummarizedText(data);
      toast({ title: 'Synthesis Complete', description: 'Your content has been successfully vectorized.' });
    },
    onError: (error) => {
      submissionBuffer.current = false;
      console.error('[Summarizer] Neural link failure:', error);
    }
  });

  const form = useForm<SummarizerFormValues>({
    resolver: zodResolver(summarizerSchema),
    defaultValues: { text: '', length: 'medium' },
  });

  // 2. INGESTION PROTOCOL — Guarded file extraction
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user) {
      if (!user) toast({ title: "Identity Offline", description: "You must be authenticated to process file vectors.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const client = container.resolve(DocumentProcessingApiClient);
      const result = await client.processFileApi(formData);
      
      if (result.isFailure) throw result.error;
      const data = result.getValue();
      
      const payload = data.markdown || data.text || '';
      form.setValue('text', payload, { shouldValidate: true });
      
      toast({ title: "Payload Extracted", description: `Vector identified from ${file.name}.` });
      refetchUser();
    } catch (error: any) {
      console.error('[Summarizer:Ingestion] Extraction failure:', error);
      toast({ 
        title: "Ingestion Error", 
        description: error.message || "Failed to process the selected file vector.", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, form, refetchUser, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  // 3. SUBMISSION VECTOR — Guarded synthesis trigger
  const onSubmit = useCallback((data: SummarizerFormValues) => {
    if (submissionBuffer.current || !data.text.trim()) return;
    
    submissionBuffer.current = true;
    summarizeMutation.mutate(data);
  }, [summarizeMutation]);

  const handleCopy = useCallback(() => {
    if (!summarizedText) return;
    try {
        navigator.clipboard.writeText(summarizedText).then(() => {
          setIsCopied(true);
          toast({ title: 'Vector Captured', description: 'Content successfully copied to clipboard.' });
          setTimeout(() => setIsCopied(false), 2000);
        });
    } catch (e) {
        console.warn('[Summarizer] Clipboard access restricted:', e);
    }
  }, [summarizedText, toast]);

  return {
    t,
    form,
    summarizeMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    summarizedText,
    isCopied,
    handleCopy,
  };
}
