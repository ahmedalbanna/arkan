'use client';

import { DiagramTypeSchema } from '@/ai/schemas';
import { generateDiagramAction } from '@/app/actions/diagramActions';
import { useToast } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import pako from 'pako';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { encode64 } from '@/lib/utils/encode64';

const formSchema = z.object({
  text: z.string().min(10, 'Description must be at least 10 characters long.'),
  diagramType: DiagramTypeSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function usePlantUmlGeneratorLogic() {
  const { toast } = useToast();
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Call server action directly
  const mutation = useMutation<any, Error, { description: string, diagramType: FormValues['diagramType'] }>({
    mutationFn: (variables) => generateDiagramAction(variables),
    onSuccess: (data) => {
      setGeneratedCode(data.plantUmlCode);
      toast({ title: 'Diagram generated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', diagramType: 'useCase' },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ description: data.text, diagramType: data.diagramType });
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const imageUrl = useMemo(() => {
    if (!generatedCode) return '';
    try {
      const data = new TextEncoder().encode(generatedCode);
      const compressed = pako.deflate(data, { level: 9 });
      const encoded = encode64(compressed);
      return `https://www.plantuml.com/plantuml/png/~1${encoded}`;
    } catch (e) {
      console.error("Failed to generate PlantUML URL", e);
      return '';
    }
  }, [generatedCode]);

  return {
    form,
    mutation,
    onSubmit,
    generatedCode,
    isCopied,
    handleCopy,
    imageUrl,
  };
}
