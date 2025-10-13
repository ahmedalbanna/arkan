
'use client';

import type { PlagiarismCheckOutput } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { usePlagiarismCheckerLogic } from '@/hooks';
import { ExternalLink, Loader2, ShieldCheck, UploadCloud } from 'lucide-react';
import Link from 'next/link';

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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.plagiarismChecker.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.plagiarismChecker.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                  <TabsTrigger value="paste" className="hover:shadow-soft transition-all duration-200">{t('writingTools.plagiarismChecker.pasteTab')}</TabsTrigger>
                  <TabsTrigger value="upload" className="hover:shadow-soft transition-all duration-200">{t('writingTools.plagiarismChecker.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                  <Textarea
                    {...form.register('text')}
                    rows={12}
                    placeholder={t('writingTools.plagiarismChecker.placeholder')}
                    className="resize-none hover:shadow-soft transition-all duration-200"
                    disabled={mutation.isPending || isUploading}
                  />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary bg-gradient-to-r from-primary/10 to-blue-500/10' : 'border-border bg-gradient-to-r from-background/50 to-primary/5'} hover:shadow-soft`}>
                    <input {...getInputProps()} />
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mx-auto w-fit mb-4">
                      <UploadCloud className="h-12 w-12 text-white" />
                    </div>
                    {isUploading ? (
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.plagiarismChecker.processingFile')}</p>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.plagiarismChecker.dropzoneHint')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{t('writingTools.plagiarismChecker.supportedFiles')}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </AnimatedContainer>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="me-2 h-4 w-4" />}
                {t('writingTools.plagiarismChecker.checkButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {mutation.isPending && (
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mr-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                  {t('writingTools.plagiarismChecker.analyzing')}
                </div>
              </div>
            </AnimatedContainer>
          )}

          {results && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-4 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <h3 className="font-semibold text-lg font-headline">{t('writingTools.plagiarismChecker.reportTitle')}</h3>
                <Card className="bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
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
                  <h4 className="font-semibold font-headline">{t('writingTools.plagiarismChecker.matchesTitle')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('writingTools.plagiarismChecker.matchesDescription')}
                  </p>
                  {results.matches.length > 0 ? (
                    <div className="space-y-4">
                      {results.matches.map((match: PlagiarismCheckOutput['matches'][0], index: number) => (
                        <AnimatedContainer key={index} animation="fade-in-up" delay={700 + index * 100}>
                          <div className="border p-4 rounded-lg space-y-2 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                            <div className="flex justify-between items-start gap-4">
                              <p className="font-semibold">{match.title}</p>
                              <Badge variant={match.similarity > 75 ? 'destructive' : match.similarity > 50 ? 'secondary' : 'outline'} className="shadow-soft">
                                {t('writingTools.plagiarismChecker.matchBadge').replace('{similarity}', match.similarity.toString())}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground italic">&quot;{match.summary}&quot;</p>
                            <Link href={match.source} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                              {match.source} <ExternalLink className="inline h-3 w-3" />
                            </Link>
                          </div>
                        </AnimatedContainer>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
                      <p>{t('writingTools.plagiarismChecker.noMatches')}</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
