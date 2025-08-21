
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, ArrowRight, UploadCloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { useGrammarCheck } from '@/hooks/use-writing-tools';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '../ui/tabs';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services/document-processing-service';
import { useLocalization } from '@/context/LocalizationContext';

const grammarSchema = z.object({
  text: z.string().min(5, 'Text must be at least 5 characters to check.'),
});

type GrammarFormValues = z.infer<typeof grammarSchema>;

export function GrammarCheckerTool() {
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);
  const mutation = useGrammarCheck();
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<GrammarFormValues>({
    resolver: zodResolver(grammarSchema),
    defaultValues: { text: '' },
  });

   const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to process files.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = await firebaseUser.getIdToken();
        const result = await processFileApi(formData, token);
        form.setValue('text', result.markdown, { shouldValidate: true });
        toast({ title: "File Processed", description: `Text extracted from ${file.name}. You can now start the analysis.` });
        refetchUser();
    } catch (error: any) {
        toast({ title: "File Processing Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  }, [firebaseUser, form, refetchUser, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
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
        <CardTitle>{t('writingTools.grammarChecker.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.grammarChecker.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">{t('writingTools.grammarChecker.pasteTab')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('writingTools.grammarChecker.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                     <Textarea
                        {...form.register('text')}
                        rows={12}
                        placeholder={t('writingTools.grammarChecker.placeholder')}
                        className="resize-none"
                        />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        {isUploading ? (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.grammarChecker.processingFile')}</p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.grammarChecker.dropzoneHint')}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t('writingTools.grammarChecker.supportedFiles')}</p>
                    </div>
                </TabsContent>
            </Tabs>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.grammarChecker.buttonText')}
          </Button>
        </form>

        {(mutation.isPending || results) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>{t('writingTools.grammarChecker.correctedLabel')}</span>
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
              <h3 className="font-semibold text-muted-foreground">{t('writingTools.grammarChecker.changesLabel')}</h3>
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
                        <p>{t('writingTools.grammarChecker.noCorrections')}</p>
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
