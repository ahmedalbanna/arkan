
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

const humanizerSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters to humanize.'),
});

type HumanizerFormValues = z.infer<typeof humanizerSchema>;

export function useHumanizerLogic() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/humanize');

  const form = useForm<HumanizerFormValues>({
    resolver: zodResolver(humanizerSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = (data: HumanizerFormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({ title: t('writingTools.humanizer.toastSuccess') });
      },
    });
  };

  const originalText = form.watch('text');
  const processedText = (mutation.data as { humanizedText: string } | null)?.humanizedText || '';

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
