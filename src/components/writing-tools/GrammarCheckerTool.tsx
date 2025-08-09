
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useGrammarCheck } from '@/hooks/use-writing-tools';
import type { GrammarCheckOutput } from '@/ai/flows/grammar-checker';

const grammarSchema = z.object({
  text: z.string().min(5, 'Please enter at least 5 characters to check.'),
});

type GrammarFormValues = z.infer<typeof grammarSchema>;

export function GrammarCheckerTool() {
  const [isCopied, setIsCopied] = useState(false);
  const mutation = useGrammarCheck();
  
  const form = useForm<GrammarFormValues>({
    resolver: zodResolver(grammarSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = async (data: GrammarFormValues) => {
    mutation.mutate({ text: data.text }, {
      onSuccess: () => {
        toast({ title: 'Grammar check successful!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const results = mutation.data;

  const handleCopy = () => {
    if (!results?.correctedText) return;
    navigator.clipboard.writeText(results.correctedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grammar Checker</CardTitle>
        <CardDescription>Enter the text you want to check, and the AI will correct any mistakes and explain the changes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-check">Your Text</Label>
            <Textarea
              id="text-to-check"
              {...form.register('text')}
              rows={8}
              placeholder="Paste your text here..."
              className="resize-none"
              disabled={mutation.isPending}
            />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
            )}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Check & Correct Text
          </Button>
        </form>

        {(mutation.isPending || results) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>Corrected Text</span>
                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!results}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </h3>
              <ScrollArea className="h-96 rounded-md border p-4 bg-muted/30">
                {mutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown components={markdownComponents}>{results?.correctedText || ''}</ReactMarkdown>
                  </div>
                )}
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">Changes & Explanations</h3>
              <ScrollArea className="h-96 rounded-md border p-4">
                {mutation.isPending ? (
                   <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : results?.corrections && results.corrections.length > 0 ? (
                    <div className="space-y-4">
                        {results.corrections.map((correction, index) => (
                            <div key={index} className="text-sm border-b pb-3 last:border-b-0">
                                <div className="flex items-center gap-2">
                                    <span className="line-through text-destructive/80">{correction.original}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-green-600 font-semibold">{correction.corrected}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 pl-1">{correction.explanation}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No corrections were needed.</p>
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
