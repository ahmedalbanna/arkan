
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';

const citationGeneratorSchema = z.object({
  sourceText: z.string().min(10, 'Please enter at least 10 characters of source material.'),
  style: z.enum(['apa', 'mla', 'chicago', 'ieee']),
});

type CitationFormValues = z.infer<typeof citationGeneratorSchema>;

export function CitationGeneratorTool() {
  const { t } = useLocalization();
  const [generatedCitations, setGeneratedCitations] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  const citationMutation = useWritingTool('/api/writing-tools/citation-generator', {
    onSuccess: (data: any) => {
        setGeneratedCitations(data.citations || []);
        toast({ title: t('writingTools.citationGenerator.toastSuccess') });
    },
    onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<CitationFormValues>({
    resolver: zodResolver(citationGeneratorSchema),
    defaultValues: { sourceText: '', style: 'apa' },
  });

  const onSubmit = (data: CitationFormValues) => {
    setGeneratedCitations([]);
    citationMutation.mutate(data);
  };

  const handleCopy = () => {
    if (generatedCitations.length === 0) return;
    navigator.clipboard.writeText(generatedCitations.join('\n\n')).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.citationGenerator.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.citationGenerator.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-text">{t('writingTools.citationGenerator.sourceLabel')}</Label>
            <Textarea
              id="source-text"
              {...form.register('sourceText')}
              rows={8}
              placeholder={t('writingTools.citationGenerator.placeholder')}
              className="resize-none"
            />
            {form.formState.errors.sourceText && <p className="text-sm text-destructive">{form.formState.errors.sourceText.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="citation-style">{t('writingTools.citationGenerator.styleLabel')}</Label>
            <Controller
              name="style"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="citation-style">
                    <SelectValue placeholder={t('writingTools.citationGenerator.stylePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="ieee">IEEE</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={citationMutation.isPending} className="w-full">
            {citationMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.citationGenerator.generateButton')}
          </Button>
        </form>

        {(citationMutation.isPending || generatedCitations.length > 0) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>{t('writingTools.citationGenerator.generatedLabel')}</span>
              {generatedCitations.length > 0 && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </h3>
            <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
              {citationMutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
              ) : (
                <ul className="space-y-4">
                  {generatedCitations.map((citation, index) => (
                    <li key={index} className="text-sm font-mono prose dark:prose-invert max-w-none"><ReactMarkdown components={markdownComponents}>{citation}</ReactMarkdown></li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
