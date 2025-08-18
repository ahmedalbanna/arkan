'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGenerateCitation } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

const citationGeneratorSchema = z.object({
  sourceText: z.string().min(10, 'Please enter at least 10 characters of source material.'),
  style: z.enum(['apa', 'mla', 'chicago', 'ieee']),
});

type CitationFormValues = z.infer<typeof citationGeneratorSchema>;

export function CitationGeneratorTool() {
  const { t } = useLocalization();
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const citationMutation = useGenerateCitation();

  const form = useForm<CitationFormValues>({
    resolver: zodResolver(citationGeneratorSchema),
    defaultValues: { sourceText: '', style: 'apa' },
  });

  const onSubmit = (data: CitationFormValues) => {
    setGeneratedCitation('');
    citationMutation.mutate(data, {
      onSuccess: (result) => {
        setGeneratedCitation(result.citation);
        toast({ title: t('writingTools.citationGenerator.toastSuccess') });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleCopy = () => {
    if (!generatedCitation) return;
    navigator.clipboard.writeText(generatedCitation).then(() => {
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

        {(citationMutation.isPending || generatedCitation) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>{t('writingTools.citationGenerator.generatedLabel')}</span>
              {generatedCitation && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </h3>
            <div className="rounded-md border p-4 bg-muted/30 min-h-[6rem] flex items-center">
              {citationMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <p className="text-sm font-mono">{generatedCitation}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
