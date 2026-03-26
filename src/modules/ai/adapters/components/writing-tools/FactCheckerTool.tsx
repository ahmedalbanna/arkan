
'use client';

import type { ClaimStatus, FactCheckOutput } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useFactCheckerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-fact-checker-logic';
import { CheckCircle, ExternalLink, HelpCircle, Loader2, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import Link from 'next/link';

function getStatusInfo(status: ClaimStatus) {
  switch (status) {
    case 'Verified':
      return { icon: CheckCircle, color: 'text-green-500', badgeVariant: 'default' as const };
    case 'Inconclusive':
      return { icon: HelpCircle, color: 'text-yellow-500', badgeVariant: 'secondary' as const };
    case 'False':
      return { icon: XCircle, color: 'text-destructive', badgeVariant: 'destructive' as const };
  }
};

function getScoreColor(score: number) {
  if (score < 50) return 'text-destructive';
  if (score < 80) return 'text-yellow-500';
  return 'text-green-500';
}

export function FactCheckerTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
  } = useFactCheckerLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.factChecker.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.factChecker.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">{t('writingTools.factChecker.pasteTab')}</TabsTrigger>
              <TabsTrigger value="upload">{t('writingTools.factChecker.uploadTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-4">
              <Textarea
                {...form.register('text')}
                rows={12}
                placeholder={t('writingTools.factChecker.placeholder')}
                className="resize-none"
                disabled={mutation.isPending || isUploading}
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                {isUploading ? (
                  <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.factChecker.processingFile')}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.factChecker.dropzoneHint')}</p>
                )}
                <p className="text-xs text-muted-foreground">{t('writingTools.factChecker.supportedFiles')}</p>
              </div>
            </TabsContent>
          </Tabs>
          {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.factChecker.checkButton')}
          </Button>
        </form>

        {mutation.isPending && (
          <div className="pt-6 border-t">
            <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t('writingTools.factChecker.analyzing')}
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.factChecker.reportTitle')}</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center justify-center text-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(results.originalityScore)}`}>
                  {results.originalityScore}%
                </div>
                <div>
                  <p className="font-semibold">{t('writingTools.factChecker.originalityScore')}</p>
                  <p className="text-xs text-muted-foreground">{t('writingTools.factChecker.originalityScoreDesc')}</p>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <h4 className="font-semibold">{t('writingTools.factChecker.matchesTitle')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('writingTools.factChecker.matchesDescription')}
              </p>
              {results.claims.length > 0 ? (
                <div className="space-y-4">
                  {results.claims.map((claim: FactCheckOutput['claims'][0], index: number) => {
                    const { icon: Icon, color, badgeVariant } = getStatusInfo(claim.status);
                    return (
                      <div key={index} className="border p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-medium italic">"{claim.statement}"</p>
                          <Badge variant={badgeVariant} className="flex-shrink-0 ml-4">
                            <Icon className={`mr-1 h-3.5 w-3.5 ${color}`} />
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{claim.explanation}</p>
                        <p className="text-xs text-muted-foreground">{t('writingTools.factChecker.sourceLabel')}
                          <Link href={`https://${claim.source}`} target="_blank" className="hover:underline text-primary">
                            {claim.source} <ExternalLink className="inline h-3 w-3" />
                          </Link>
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
                  <p>{t('writingTools.factChecker.noClaims')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
