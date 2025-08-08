
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParaphraseText } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, Diff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';

const paraphraserSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to paraphrase.'),
  mode: z.enum(['standard', 'fluent', 'formal', 'creative', 'simplify']),
});

type ParaphraserFormValues = z.infer<typeof paraphraserSchema>;

export function ParaphraserTool() {
  const [originalText, setOriginalText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const paraphraseMutation = useParaphraseText();

  const form = useForm<ParaphraserFormValues>({
    resolver: zodResolver(paraphraserSchema),
    defaultValues: { text: '', mode: 'standard' },
  });

  const onSubmit = (data: ParaphraserFormValues) => {
    setOriginalText(data.text);
    paraphraseMutation.mutate(data, {
      onSuccess: (result) => {
        setParaphrasedText(result.paraphrasedText);
        toast({ title: 'Paraphrasing successful!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleCopy = () => {
    if (!paraphrasedText) return;
    navigator.clipboard.writeText(paraphrasedText).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paraphrasing Tool</CardTitle>
        <CardDescription>Enter the text you want to rewrite, select a mode, and let the AI do the rest.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-paraphrase">Your Text</Label>
            <Textarea
              id="text-to-paraphrase"
              {...form.register('text')}
              rows={8}
              placeholder="Paste your text here..."
              className="resize-none"
            />
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paraphrase-mode">Mode</Label>
            <Controller
              name="mode"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="paraphrase-mode">
                    <SelectValue placeholder="Select a paraphrasing mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fluent">Fluent</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="simplify">Simplify</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={paraphraseMutation.isPending} className="w-full">
            {paraphraseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Paraphrase Text
          </Button>
        </form>

        {(paraphraseMutation.isPending || paraphrasedText) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">Original Text</h3>
              <ScrollArea className="h-64 rounded-md border p-4">
                 <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown></div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
               <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>Paraphrased Text</span>
                 <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </h3>
              <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
                {paraphraseMutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{paraphrasedText}</ReactMarkdown></div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
