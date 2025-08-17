
'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParaphraseText } from '@/hooks/use-writing-tools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, UploadCloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services/document-processing-service';
import { useLocalization } from '@/context/LocalizationContext';

const paraphraserSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters to paraphrase.'),
  mode: z.enum(['standard', 'fluent', 'formal', 'creative', 'simplify']),
});

type ParaphraserFormValues = z.infer<typeof paraphraserSchema>;

export function ParaphraserTool() {
  const { t } = useLocalization();
  const [originalText, setOriginalText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const paraphraseMutation = useParaphraseText();
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ParaphraserFormValues>({
    resolver: zodResolver(paraphraserSchema),
    defaultValues: { text: '', mode: 'standard' },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
        toast({ title: t('writingTools.paraphraser.toastAuthError'), description: t('writingTools.paraphraser.toastAuthErrorDesc'), variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = await firebaseUser.getIdToken();
        const result = await processFileApi(formData, token);
        form.setValue('text', result.markdown, { shouldValidate: true });
        toast({ title: t('writingTools.paraphraser.toastFileProcessed'), description: t('writingTools.paraphraser.toastFileProcessedDesc').replace('{fileName}', file.name) });
        refetchUser();
    } catch (error: any) {
        toast({ title: t('writingTools.paraphraser.toastFileFailed'), description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  }, [firebaseUser, form, refetchUser, toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const onSubmit = (data: ParaphraserFormValues) => {
    setOriginalText(data.text);
    paraphraseMutation.mutate(data, {
      onSuccess: (result) => {
        setParaphrasedText(result.paraphrasedText);
        toast({ title: t('writingTools.paraphraser.toastSuccess') });
      },
      onError: (error) => {
        toast({ title: t('writingTools.paraphraser.toastError'), description: error.message, variant: 'destructive' });
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
        <CardTitle>{t('writingTools.paraphraser.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.paraphraser.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
           <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">{t('writingTools.paraphraser.pasteTab')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('writingTools.paraphraser.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                     <Textarea
                        {...form.register('text')}
                        rows={8}
                        placeholder={t('writingTools.paraphraser.placeholder')}
                        className="resize-none"
                        />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        {isUploading ? (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.paraphraser.processingFile')}</p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.paraphraser.dropzoneHint')}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t('writingTools.paraphraser.supportedFiles')}</p>
                    </div>
                </TabsContent>
            </Tabs>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          

          <div className="space-y-2">
            <Label htmlFor="paraphrase-mode">{t('writingTools.paraphraser.modeLabel')}</Label>
            <Controller
              name="mode"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="paraphrase-mode">
                    <SelectValue placeholder={t('writingTools.paraphraser.modePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">{t('writingTools.paraphraser.modes.standard')}</SelectItem>
                    <SelectItem value="fluent">{t('writingTools.paraphraser.modes.fluent')}</SelectItem>
                    <SelectItem value="formal">{t('writingTools.paraphraser.modes.formal')}</SelectItem>
                    <SelectItem value="creative">{t('writingTools.paraphraser.modes.creative')}</SelectItem>
                    <SelectItem value="simplify">{t('writingTools.paraphraser.modes.simplify')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={paraphraseMutation.isPending || isUploading} className="w-full">
            {paraphraseMutation.isPending || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {t('writingTools.paraphraser.buttonText')}
          </Button>
        </form>

        {(paraphraseMutation.isPending || paraphrasedText) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">{t('writingTools.paraphraser.originalLabel')}</h3>
              <ScrollArea className="h-64 rounded-md border p-4">
                 <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown></div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
               <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>{t('writingTools.paraphraser.processedLabel')}</span>
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
