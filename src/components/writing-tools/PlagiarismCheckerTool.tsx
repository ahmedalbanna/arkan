
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldCheck, ExternalLink, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { PlagiarismCheckOutput } from '@/ai/schemas';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { usePlagiarismCheckerLogic } from '@/hooks';

export function PlagiarismCheckerTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    getScoreColor,
    results,
  } = usePlagiarismCheckerLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.plagiarismChecker.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.plagiarismChecker.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">{t('writingTools.plagiarismChecker.pasteTab')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('writingTools.plagiarismChecker.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                     <Textarea
                        {...form.register('text')}
                        rows={12}
                        placeholder={t('writingTools.plagiarismChecker.placeholder')}
                        className="resize-none"
                        disabled={mutation.isPending || isUploading}
                        />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        {isUploading ? (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.plagiarismChecker.processingFile')}</p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.plagiarismChecker.dropzoneHint')}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t('writingTools.plagiarismChecker.supportedFiles')}</p>
                    </div>
                </TabsContent>
            </Tabs>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="me-2 h-4 w-4" />}
            {t('writingTools.plagiarismChecker.checkButton')}
          </Button>
        </form>

        {mutation.isPending && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('writingTools.plagiarismChecker.analyzing')}
                </div>
            </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.plagiarismChecker.reportTitle')}</h3>
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center justify-center text-center gap-4">
                     <div className={`text-6xl font-bold ${getScoreColor(results.originalityScore)}`}>
                        {results.originalityScore}%
                    </div>
                    <div>
                        <p className="font-semibold">{t('writingTools.plagiarismChecker.originalityScore')}</p>
                        <p className="text-xs text-muted-foreground">{t('writingTools.plagiarismChecker.originalityScoreDesc')}</p>
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-2">
              <h4 className="font-semibold">{t('writingTools.plagiarismChecker.matchesTitle')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('writingTools.plagiarismChecker.matchesDescription')}
              </p>
               {results.matches.length > 0 ? (
                <div className="space-y-4">
                    {results.matches.map((match: PlagiarismCheckOutput['matches'][0], index: number) => (
                        <div key={index} className="border p-4 rounded-lg space-y-2">
                            <div className="flex justify-between items-start gap-4">
                                <p className="font-semibold">{match.title}</p>
                                <Badge variant={match.similarity > 75 ? 'destructive' : match.similarity > 50 ? 'secondary' : 'outline'}>
                                  {t('writingTools.plagiarismChecker.matchBadge').replace('{similarity}', match.similarity.toString())}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground italic">"{match.summary}"</p>
                             <Link href={match.source} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                                {match.source} <ExternalLink className="inline h-3 w-3" />
                            </Link>
                        </div>
                    ))}
                </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
                    <p>{t('writingTools.plagiarismChecker.noMatches')}</p>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
