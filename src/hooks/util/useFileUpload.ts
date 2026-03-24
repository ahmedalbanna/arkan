'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { DocumentProcessingApiClient } from '@/modules/ai-content/adapters/api-client/DocumentProcessingApiClient';
import { UseFormSetValue } from 'react-hook-form';
import { container } from '@/infrastructure/di/container';

interface UseFileUploadOptions {
  onSuccess?: (fileName: string) => void;
  onError?: (error: string) => void;
  fieldName?: string;
  acceptedFormats?: {
    [key: string]: string[];
  };
}

export function useFileUpload(
  setValue: UseFormSetValue<any>,
  options: UseFileUploadOptions = {},
) {
  const {
    onSuccess,
    onError,
    fieldName = 'text',
    acceptedFormats = {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
      const errorMsg = 'You must be logged in to process files.';
      toast({
        title: 'Authentication Error',
        description: errorMsg,
        variant: 'destructive',
      });
      onError?.(errorMsg);
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

      setValue(fieldName, data.markdown || data.text, { shouldValidate: true });

      const successMsg = `Text extracted from ${file.name}.`;
      toast({ title: 'File Processed', description: successMsg });

      onSuccess?.(file.name);
      refetchUser();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process file';
      toast({
        title: 'File Processing Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      onError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  }, [fieldName, firebaseUser, onError, onSuccess, refetchUser, setValue, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: acceptedFormats,
  });

  return {
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
  };
}
