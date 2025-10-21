
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { toast, useWritingTool } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  topic: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  documentType: z.string().min(1, 'Please select a document type.'),
  knowledge: z.string().optional(),
  tableOfContents: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function useDocumentWriterLogic() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const mutation = useWritingTool('/api/writing-tools/write-document', {
    onSuccess: (data: any) => {
      setGeneratedContent(data.documentContent);
      toast({ title: 'Document generated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '', documentType: 'essay', knowledge: '', tableOfContents: '' },
  });

  const onSubmit = (data: FormValues) => {
    const submissionData = {
      ...data,
      tableOfContents: data.tableOfContents ? data.tableOfContents.split('\n').filter(line => line.trim() !== '') : undefined,
    };
    mutation.mutate(submissionData);
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent).then(() => {
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
    generatedContent,
    isCopied,
    handleCopy,
  };
}
