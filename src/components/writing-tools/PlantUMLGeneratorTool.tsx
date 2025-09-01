'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { DiagramTypeSchema } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWritingTool } from '@/hooks/use-writing-tools';
import { Check, Code, Copy, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import pako from 'pako';

// Helper to encode the deflated PlantUML code for the PlantUML server
function encode64(data: Uint8Array) {
  const r = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
  let out = "";
  for (let i = 0; i < data.length; i += 3) {
    const val1 = data[i];
    const val2 = i + 1 < data.length ? data[i + 1] : 0;
    const val3 = i + 2 < data.length ? data[i + 2] : 0;

    const ch1 = val1 >> 2;
    const ch2 = ((val1 & 3) << 4) | (val2 >> 4);
    const ch3 = ((val2 & 15) << 2) | (val3 >> 6);
    const ch4 = val3 & 63;

    out += r.charAt(ch1);
    out += r.charAt(ch2);
    if (i + 1 < data.length) out += r.charAt(ch3);
    if (i + 2 < data.length) out += r.charAt(ch4);
  }
  return out;
}

const formSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  diagramType: DiagramTypeSchema,
});

type FormValues = z.infer<typeof formSchema>;

const diagramTypes = DiagramTypeSchema.options.map(value => {
  let label = '';
  if (value === 'er') {
    label = 'ER Diagram';
  } else {
    label = value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }
  return { value, label };
});

export function PlantUMLGeneratorTool() {
  const { toast } = useToast();
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('/api/writing-tools/generate-plantuml', {
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
    defaultValues: { description: '', diagramType: 'useCase' },
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
      const compressed = pako.deflate(data);
      const encoded = encode64(compressed);
      return `https://www.plantuml.com/plantuml/png/~1${encoded}`;
    } catch (e) {
      console.error("Failed to generate PlantUML URL", e);
      return '';
    }
  }, [generatedCode]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>PlantUML Diagram Generator</CardTitle>
        <CardDescription>Describe the diagram you want, and the AI will generate the PlantUML code for it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagramType">Diagram Type</Label>
            <Controller
              name="diagramType"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                  <SelectTrigger id="diagramType">
                    <SelectValue placeholder="Select a diagram type" />
                  </SelectTrigger>
                  <SelectContent>
                    {diagramTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              rows={8}
              placeholder="e.g., A user logs into the system. The system authenticates the user. If successful, the user can view their dashboard."
              disabled={mutation.isPending}
            />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            Generate Diagram (1 Credit)
          </Button>
        </form>

        {(mutation.isPending || generatedCode) && (
          <div className="space-y-4 pt-6 border-t">
            <Tabs defaultValue="preview" className="w-full">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="preview"><ImageIcon className="me-2 h-4 w-4" /> Preview</TabsTrigger>
                  <TabsTrigger value="code"><Code className="me-2 h-4 w-4" /> Code</TabsTrigger>
                </TabsList>
                {generatedCode && (
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <TabsContent value="preview" className="mt-4">
                <Card className="min-h-[400px] flex items-center justify-center p-4 bg-muted/30">
                  {mutation.isPending ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : imageUrl ? (
                    <Image src={imageUrl} alt="Generated PlantUML Diagram" width={800} height={600} className="object-contain" unoptimized />
                  ) : (
                    <p>Could not render diagram.</p>
                  )}
                </Card>
              </TabsContent>
              <TabsContent value="code" className="mt-4">
                <ScrollArea className="h-[400px] rounded-md border">
                  <Textarea
                    readOnly
                    value={generatedCode}
                    className="h-full p-4 bg-muted/30 text-left font-mono text-xs resize-none border-0 focus-visible:ring-0"
                    dir="ltr"
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
