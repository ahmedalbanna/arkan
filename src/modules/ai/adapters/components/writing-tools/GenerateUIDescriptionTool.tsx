'use client';

import { GenerateUIDescriptionInputSchema, type GenerateUIDescriptionInput } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

type FormValues = GenerateUIDescriptionInput;


export function GenerateUIDescriptionTool() {
  const { t } = useLocalization();
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('/api/writing-tools/generate-ui-description', {
    onSuccess: (data: any) => {
      setGeneratedDescription(data.uiDescription);
      toast({ title: t('writingTools.uiDescription.successToast') });
    },
    onError: (error) => {
      toast({ title: t('writingTools.uiDescription.errorToast'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateUIDescriptionInputSchema),
    defaultValues: {
      projectFeatures: '',
      designType: 'website',
    },
  });

  function onSubmit(data: FormValues) {
    mutation.mutate(data);
  }

  function handleCopy() {
    if (!generatedDescription) return;
    navigator.clipboard.writeText(generatedDescription).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.uiDescription.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.uiDescription.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="features">{t('writingTools.uiDescription.featuresLabel')}</Label>
            <Textarea
              id="features"
              {...form.register('projectFeatures')}
              rows={8}
              placeholder={t('writingTools.uiDescription.featuresPlaceholder')}
              className="resize-y"
              disabled={mutation.isPending}
            />
            {form.formState.errors.projectFeatures && <p className="text-sm text-destructive">{form.formState.errors.projectFeatures.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-type">{t('writingTools.uiDescription.designTypeLabel')}</Label>
            <Controller
              name="designType"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                  <SelectTrigger id="design-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.uiDescription.buttonText')}
          </Button>
        </form>

        {(mutation.isPending || generatedDescription) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>{t('writingTools.uiDescription.generatedDescriptionLabel')}</span>
              {generatedDescription && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </h3>
            <ScrollArea className="h-[60vh] rounded-md border p-4 bg-muted/30">
              {mutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown components={markdownComponents}>{generatedDescription}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
