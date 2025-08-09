
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useHumanizeText } from '@/hooks/use-writing-tools';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
});

type FormValues = z.infer<typeof formSchema>;


export function HumanizerTool() {
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const mutation = useHumanizeText();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '' },
  });


  const onSubmit = async (data: FormValues) => {
    setOriginalText(data.text);
    mutation.mutate({ text: data.text }, {
      onSuccess: (result) => {
        setProcessedText(result.humanizedText);
        toast({ title: 'Text successfully humanized!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleCopy = () => {
    if (!processedText) return;
    navigator.clipboard.writeText(processedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Humanizer</CardTitle>
        <CardDescription>Paste your AI-generated text below, and the tool will rewrite it to have a more human-like tone and style.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Your Text</Label>
            <Textarea
              id="text-input"
              {...form.register('text')}
              rows={8}
              placeholder="Paste your AI-generated text here..."
              className="resize-none"
            />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
            )}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Humanize Text
          </Button>
        </form>

        {(mutation.isPending || processedText) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">Original AI Text</h3>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>Humanized Text</span>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </h3>
              <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
                {mutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown components={markdownComponents}>{processedText}</ReactMarkdown>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

