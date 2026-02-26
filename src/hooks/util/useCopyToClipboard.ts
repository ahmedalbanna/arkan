'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/util/use-toast';

interface UseCopyToClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  duration?: number;
}

/**
 * Custom hook for copying text to clipboard with toast notifications.
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const {
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy to clipboard',
    duration = 2000,
  } = options;

  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = useCallback(async (text: string) => {
    if (!text) {
      toast({
        title: 'Error',
        description: 'No text to copy',
        variant: 'destructive',
      });
      return false;
    }

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Success',
        description: successMessage,
        duration,
      });
      return true;
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [successMessage, errorMessage, duration, toast]);

  return {
    isCopying,
    copyToClipboard,
  };
}
