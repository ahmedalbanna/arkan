
'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool, useToast } from '@/hooks';
import { DiagramTypeSchema } from '@/modules/ai/domain/schemas';
import pako from 'pako';

// Helper to encode the deflated PlantUML code for the PlantUML server
function encode64(data: Uint8Array): string {
  const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    const val1 = data[i];
    const val2 = i + 1 < data.length ? data[i + 1] : 0;
    const val3 = i + 2 < data.length ? data[i + 2] : 0;

    const ch1 = val1 >> 2;
    const ch2 = ((val1 & 3) << 4) | (val2 >> 4);
    const ch3 = ((val2 & 15) << 2) | (val3 >> 6);
    const ch4 = val3 & 63;

    r += B64_MAP.charAt(ch1);
    r += B64_MAP.charAt(ch2);
    if (i + 1 < data.length) r += B64_MAP.charAt(ch3);
    if (i + 2 < data.length) r += B64_MAP.charAt(ch4);
  }
  return r;
}


const formSchema = z.object({
  text: z.string().min(10, 'Description must be at least 10 characters long.'),
  diagramType: DiagramTypeSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function usePlantUmlGeneratorLogic() {
  const { toast } = useToast();
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('generate-plantuml', {
    onSuccess: (data: any) => {
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
    mutation.mutate(data);
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
