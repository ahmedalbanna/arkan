
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
import { toast } from '@/hooks';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { useWritingTool } from '@/hooks';
import type { HumanizeTextOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
});

type FormValues = z.infer<typeof formSchema>;


export function HumanizerTool() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('/api/ai/writing-tools/humanize');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '' },
  });


  const onSubmit = async (data: FormValues) => {
    setOriginalText(data.text);
    mutation.mutate({ text: data.text }, {
      onSuccess: (result: any) => {
        setProcessedText(result.humanizedText);
        toast({ title: t('writingTools.humanizer.toastSuccess') });
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
        <CardTitle>{t('writingTools.humanizer.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.humanizer.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">{t('writingTools.humanizer.textLabel')}</Label>
            <Textarea
              id="text-input"
              {...form.register('text')}
              rows={8}
              placeholder={t('writingTools.humanizer.placeholder')}
              className="resize-none"
            />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
            )}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="me-2 h-4 w-4" />
            )}
            {t('writingTools.humanizer.buttonText')}
          </Button>
        </form>

        {(mutation.isPending || processedText) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">{t('writingTools.humanizer.originalLabel')}</h3>
              <ScrollArea className="h-64 rounded-md border p-4">
                 <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown></div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
               <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>{t('writingTools.humanizer.processedLabel')}</span>
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
                  <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{processedText}</ReactMarkdown></div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
