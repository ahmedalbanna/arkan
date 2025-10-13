
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTextStylistLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { BookOpenText, Check, Copy, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { DiffView } from '../shared/DiffView';

const styles = [
  "Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative",
  "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative",
  "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"
];

export function AITextTune() {
  const {
    t,
    form,
    rewriteMutation,
    summarizeMutation,
    isProcessing,
    originalText,
    processedText,
    diff,
    isCopied,
    compressionRatio,
    setCompressionRatio,
    activeView,
    setActiveView,
    onSubmitRewrite,
    onSubmitSummarize,
    handleCopy,
  } = useTextStylistLogic();

  return (
    <div className="space-y-6">
      <AnimatedContainer animation="fade-in-up" delay={200}>
        <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
          <CardContent className="p-6">
            <form className="space-y-4">
               <AnimatedContainer animation="fade-in-up" delay={300}>
                 <div className="space-y-2">
                    <Label htmlFor="input-text" className="text-lg font-semibold font-headline">{t('writingTools.textStylist.yourTextLabel')}</Label>
                    <Textarea
                        id="input-text"
                        {...form.register('text')}
                        rows={8}
                        placeholder="Enter your text here..."
                        className="mt-2 hover:shadow-soft transition-all duration-200"
                        disabled={isProcessing}
                    />
                    {form.formState.errors.text && <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>}
                </div>
               </AnimatedContainer>
            </form>
          </CardContent>
        </Card>
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={400}>
        <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
              <CardTitle className="font-headline">{t('writingTools.textStylist.aiToolsTitle')}</CardTitle>
              <CardDescription>{t('writingTools.textStylist.aiToolsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedContainer animation="fade-in-up" delay={500}>
                <form onSubmit={form.handleSubmit(onSubmitRewrite)} className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 font-headline">
                      <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                        <Wand2 className="h-5 w-5 text-white" />
                      </div>
                      {t('writingTools.textStylist.rewriteTitle')}
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="style-select" className="font-headline">{t('writingTools.textStylist.styleLabel')}</Label>
                        <Controller
                        name="style"
                        control={form.control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                            <SelectTrigger id="style-select" className="hover:shadow-soft transition-all duration-200">
                                <SelectValue placeholder={t('writingTools.textStylist.stylePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                                <SelectItem value="None" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{t('writingTools.textStylist.styleNone')}</SelectItem>
                                {styles.map(s => <SelectItem key={s} value={s} className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{s}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        )}
                        />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                        {rewriteMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <Sparkles className="me-2 h-4 w-4" />}
                        {t('writingTools.textStylist.rewriteButton')}
                    </Button>
                </form>
              </AnimatedContainer>

              <AnimatedContainer animation="fade-in-up" delay={600}>
                <form onSubmit={form.handleSubmit(onSubmitSummarize)} className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 font-headline">
                      <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                        <BookOpenText className="h-5 w-5 text-white" />
                      </div>
                      {t('writingTools.textStylist.summarizeTitle')}
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label className="font-headline">{t('writingTools.textStylist.compressionRatioLabel')}</Label>
                            <Badge variant="outline" className="shadow-soft">{compressionRatio}%</Badge>
                        </div>
                        <Slider
                            value={[compressionRatio]}
                            onValueChange={(val) => setCompressionRatio(val[0])}
                            min={10} max={90} step={5}
                            disabled={isProcessing}
                            className="hover:shadow-soft transition-all duration-200"
                        />
                    </div>
                    <Button type="submit" disabled={isProcessing} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                        {summarizeMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <Sparkles className="me-2 h-4 w-4" />}
                        {t('writingTools.textStylist.summarizeButton')}
                    </Button>
                </form>
              </AnimatedContainer>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {(isProcessing || processedText || originalText) && (
          <AnimatedContainer animation="fade-in-up" delay={700}>
            <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                  <div className="flex justify-between items-center">
                      <div>
                          <CardTitle className="font-headline">{t('writingTools.textStylist.comparisonTitle')}</CardTitle>
                          <CardDescription>{t('writingTools.textStylist.comparisonDescription')}</CardDescription>
                      </div>
                       <div className="flex items-center gap-2">
                          {diff && (
                               <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
                                  <TabsList className="bg-gradient-to-r from-background/50 to-primary/5">
                                      <TabsTrigger value="side-by-side" className="hover:shadow-soft transition-all duration-200">{t('writingTools.textStylist.sideBySideTab')}</TabsTrigger>
                                      <TabsTrigger value="diff" className="hover:shadow-soft transition-all duration-200">{t('writingTools.textStylist.diffTab')}</TabsTrigger>
                                  </TabsList>
                               </Tabs>
                          )}
                          <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!processedText} className="hover:shadow-soft transition-all duration-200">
                              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                   {activeView === 'side-by-side' ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="input-text" className="font-headline">{t('writingTools.textStylist.originalTextLabel')}</Label>
                              <ScrollArea className="h-72 rounded-md border p-4 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
                                  <div className="prose dark:prose-invert max-w-none text-sm">
                                      <ReactMarkdown components={markdownComponents}>{originalText || t('writingTools.textStylist.originalTextPlaceholder')}</ReactMarkdown>
                                  </div>
                              </ScrollArea>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="output-text" className="font-headline">{t('writingTools.textStylist.processedTextLabel')}</Label>
                              <ScrollArea className="h-72 rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                                  {isProcessing ? (
                                      <div className="flex items-center justify-center h-full">
                                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="prose dark:prose-invert max-w-none text-sm">
                                          <ReactMarkdown components={markdownComponents}>{processedText || t('writingTools.textStylist.processedTextPlaceholder')}</ReactMarkdown>
                                      </div>
                                  )}
                              </ScrollArea>
                          </div>
                      </div>
                   ) : (
                      <div className="space-y-2">
                          <Label className="font-headline">{t('writingTools.textStylist.changesLabel')}</Label>
                          <ScrollArea className="h-72 rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                             {isProcessing ? (
                                  <div className="flex items-center justify-center h-full">
                                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                      </div>
                                  </div>
                              ) : (
                                  <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                                      {diff && <DiffView diff={diff} />}
                                  </div>
                              )}
                          </ScrollArea>
                      </div>
                   )}
              </CardContent>
            </Card>
          </AnimatedContainer>
      )}
    </div>
  );
}
