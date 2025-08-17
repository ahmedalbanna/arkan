
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, BrainCircuit, UploadCloud } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDetectAiContent } from '@/hooks/use-writing-tools';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services/document-processing-service';
import { useLocalization } from '@/context/LocalizationContext';

const aiDetectorSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for an accurate analysis.'),
});

type AIDetectorFormValues = z.infer<typeof aiDetectorSchema>;

interface AIAnalysisResult {
    score: number;
    analysis: string;
}

export function AIDetectorTool() {
  const { t } = useLocalization();
  const mutation = useDetectAiContent();
  const { firebaseUser, refetchUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<AIDetectorFormValues>({
    resolver: zodResolver(aiDetectorSchema),
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
        toast({ title: t('writingTools.aiDetector.toastFileProcessed'), description: t('writingTools.aiDetector.toastFileExtracted').replace('{fileName}', file.name) });
        refetchUser(); // Update credits
    } catch (error: any) {
        toast({ title: t('writingTools.aiDetector.toastFileFailed'), description: error.message, variant: "destructive" });
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

  const onSubmit = async (data: AIDetectorFormValues) => {
    mutation.mutate({ text: data.text }, {
        onError: (error) => {
            toast({ title: t('writingTools.aiDetector.toastAnalysisFailed'), description: error.message, variant: 'destructive' });
        }
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const result = mutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.aiDetector.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.aiDetector.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">{t('writingTools.aiDetector.pasteTab')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('writingTools.aiDetector.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                     <Textarea
                        id="text-to-analyze"
                        {...form.register('text')}
                        rows={12}
                        placeholder={t('writingTools.aiDetector.placeholder')}
                        className="resize-none"
                        />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        {isUploading ? (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.aiDetector.processingFile')}</p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.aiDetector.dropzoneHint')}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t('writingTools.aiDetector.supportedFiles')}</p>
                    </div>
                </TabsContent>
            </Tabs>
           
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {t('writingTools.aiDetector.analyzeButton')}
          </Button>
        </form>

        {(mutation.isPending) && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('writingTools.aiDetector.analyzing')}
                </div>
                <Progress value={50} className="w-full" />
            </div>
        )}

        {result && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.aiDetector.reportTitle')}</h3>
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('writingTools.aiDetector.probabilityScore')}</p>
                    <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{result.analysis}</p>
                </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
