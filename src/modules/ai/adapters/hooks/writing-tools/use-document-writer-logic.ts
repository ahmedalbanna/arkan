
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';

const docWriterSchema = z.object({
  topic: z.string().min(5, 'Please provide a more detailed topic.'),
  documentType: z.string().min(1, 'Please select a document type.'),
  knowledge: z.string().optional(),
  tableOfContents: z.string().optional(), // Keep as string for the textarea
});

type DocWriterFormValues = z.infer<typeof docWriterSchema>;

export function useDocumentWriterLogic() {
  const { t } = useLocalization();
  const [generatedContent, setGeneratedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('write-document', {
    onSuccess: (data: any) => {
      setGeneratedContent(data.document);
      toast({ title: 'Document generated successfully!' });
    },
  });

  const form = useForm<DocWriterFormValues>({
    resolver: zodResolver(docWriterSchema),
    defaultValues: {
      topic: '',
      documentType: 'essay',
      knowledge: '',
      tableOfContents: '',
    },
  });

  const onSubmit = (data: DocWriterFormValues) => {
    // Split tableOfContents string into an array, filtering out empty lines
    const tocArray = data.tableOfContents?.split('\n').filter(line => line.trim() !== '') || [];
    mutation.mutate({
      ...data,
      tableOfContents: tocArray.length > 0 ? tocArray : undefined,
    });
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
