
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSummarizeText } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';

const summarizerSchema = z.object({
  text: z.string().min(20, 'Please enter at least 20 characters to summarize.'),
  length: z.enum(['short', 'medium', 'long']),
});

type SummarizerFormValues = z.infer<typeof summarizerSchema>;

export function SummarizerTool() {
  const [summarizedText, setSummarizedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const summarizeMutation = useSummarizeText();

  const form = useForm<SummarizerFormValues>({
    resolver: zodResolver(summarizerSchema),
    defaultValues: { text: '', length: 'medium' },
  });

  const onSubmit = (data: SummarizerFormValues) => {
    summarizeMutation.mutate(data, {
      onSuccess: (result) => {
        setSummarizedText(result.summary);
        toast({ title: 'Summarization successful!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleCopy = () => {
    if (!summarizedText) return;
    navigator.clipboard.writeText(summarizedText).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summarizer Tool</CardTitle>
        <CardDescription>Enter the text you want to summarize, select the desired length, and let the AI do the work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-summarize">Your Text</Label>
            <Textarea
              id="text-to-summarize"
              {...form.register('text')}
              rows={10}
              placeholder="Paste your long article, report, or any text here..."
              className="resize-none"
            />
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summarize-length">Summary Length</Label>
            <Controller
              name="length"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="summarize-length">
                    <SelectValue placeholder="Select summary length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={summarizeMutation.isPending} className="w-full">
            {summarizeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Summarize Text
          </Button>
        </form>

        {(summarizeMutation.isPending || summarizedText) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>Generated Summary</span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </h3>
            <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
              {summarizeMutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown components={markdownComponents}>{summarizedText}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
