'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/context/LocalizationContext';
import { useGrammarCheckerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-grammar-checker-logic';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { ArrowRight, Check, Copy, Loader2, Sparkles, UploadCloud, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Checkbox } from '@/components/ui/checkbox';

type CorrectionType = 'grammar' | 'spelling' | 'punctuation';

export function GrammarCheckerTool() {
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
    isCopied,
    handleCopy,
  } = useGrammarCheckerLogic();

  const [filterTypes, setFilterTypes] = useState<Set<CorrectionType>>(new Set(['grammar', 'spelling', 'punctuation']));

  function toggleFilter(type: CorrectionType) {
    const newFilters = new Set(filterTypes);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setFilterTypes(newFilters);
  }

  const filteredCorrections = useMemo(() => {
    if (!results?.corrections) return [];
    return results.corrections.filter(c => filterTypes.has(c.type));
  }, [results?.corrections, filterTypes]);

  function getTypeColor(type: CorrectionType) {
    switch (type) {
      case 'grammar':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'spelling':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'punctuation':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  }

  function getTypeLabel(type: CorrectionType) {
    switch (type) {
      case 'grammar':
        return 'Grammar';
      case 'spelling':
        return 'Spelling';
      case 'punctuation':
        return 'Punctuation';
      default:
        return type;
    }
  }

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
                disabled={mutation.isPending || isUploading}
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
          <div className="space-y-6 pt-6 border-t">
            {/* Statistics */}
            {results?.statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{results.statistics.total}</div>
                    <p className="text-xs text-muted-foreground">Total Corrections</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.statistics.grammar}</div>
                    <p className="text-xs text-muted-foreground">Grammar</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{results.statistics.spelling}</div>
                    <p className="text-xs text-muted-foreground">Spelling</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{results.statistics.punctuation}</div>
                    <p className="text-xs text-muted-foreground">Punctuation</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-muted-foreground">{t('writingTools.grammarChecker.changesLabel')}</h3>
                  {results?.corrections && results.corrections.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-3 text-xs">
                        {(['grammar', 'spelling', 'punctuation'] as CorrectionType[]).map((type) => (
                          <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={filterTypes.has(type)}
                              onCheckedChange={() => toggleFilter(type)}
                            />
                            <span className={getTypeColor(type) + ' px-2 py-0.5 rounded border text-xs font-medium'}>
                              {getTypeLabel(type)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <ScrollArea className="h-96 rounded-md border p-4">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCorrections.length > 0 ? (
                    <div className="space-y-4">
                      {filteredCorrections.map((correction, index) => (
                        <div key={index} className="text-sm border-b pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={getTypeColor(correction.type)}>
                              {getTypeLabel(correction.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="line-through text-destructive/80">{correction.original}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-green-600 dark:text-green-400 font-semibold">{correction.corrected}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 pl-1">{correction.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : results?.corrections && results.corrections.length > 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No corrections match the selected filters.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>{t('writingTools.grammarChecker.noCorrections')}</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
