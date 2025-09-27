
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export function useHumanizerLogic() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('humanize', {
    onSuccess: (data: any) => {
      setProcessedText(data.humanizedText);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = (data: FormValues) => {
    setOriginalText(data.text);
    mutation.mutate({ text: data.text });
  };

  const handleCopy = () => {
    if (!processedText) return;
    navigator.clipboard.writeText(processedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return {
    t,
    form,
    mutation,
    onSubmit,
    originalText,
    processedText,
    isCopied,
    handleCopy,
  };
}
