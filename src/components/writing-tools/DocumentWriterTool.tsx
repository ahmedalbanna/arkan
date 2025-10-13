
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentWriterLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

export function DocumentWriterTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    generatedContent,
    isCopied,
    handleCopy,
  } = useDocumentWriterLogic();

  const docTypes = [
    { value: 'essay', label: t('writingTools.documentWriter.docTypeEssay') },
    { value: 'blog post', label: t('writingTools.documentWriter.docTypeBlogPost') },
    { value: 'formal report', label: t('writingTools.documentWriter.docTypeFormalReport') },
    { value: 'technical article', label: t('writingTools.documentWriter.docTypeTechnicalArticle') },
    { value: 'creative story', label: t('writingTools.documentWriter.docTypeCreativeStory') },
    { value: 'university subject material', label: t('writingTools.documentWriter.docTypeUniSubject') },
    { value: 'research paper', label: t('writingTools.documentWriter.docTypeResearchPaper') },
  ];

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.documentWriter.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.documentWriter.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="font-headline">{t('writingTools.documentWriter.topicLabel')}</Label>
                  <Input
                    id="topic"
                    {...form.register('topic')}
                    placeholder={t('writingTools.documentWriter.topicPlaceholder')}
                    disabled={mutation.isPending}
                    className="hover:shadow-soft transition-all duration-200"
                  />
                  {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-type" className="font-headline">{t('writingTools.documentWriter.docTypeLabel')}</Label>
                  <Controller
                    name="documentType"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="document-type" className="hover:shadow-soft transition-all duration-200">
                          <SelectValue placeholder={t('writingTools.documentWriter.docTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                          {docTypes.map(type => <SelectItem key={type.value} value={type.value} className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{type.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </AnimatedContainer>
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="space-y-2">
                <Label htmlFor="knowledge" className="font-headline">{t('writingTools.documentWriter.knowledgeLabel')}</Label>
                <Textarea
                  id="knowledge"
                  {...form.register('knowledge')}
                  rows={3}
                  placeholder={t('writingTools.documentWriter.knowledgePlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
              </div>
            </AnimatedContainer>
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="space-y-2">
                <Label htmlFor="toc" className="font-headline">{t('writingTools.documentWriter.tocLabel')}</Label>
                <Textarea
                  id="toc"
                  {...form.register('tableOfContents')}
                  rows={5}
                  placeholder={t('writingTools.documentWriter.tocPlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
              </div>
            </AnimatedContainer>
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.documentWriter.generateButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || generatedContent) && (
            <AnimatedContainer animation="fade-in-up" delay={700}>
              <div className="space-y-2 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-muted-foreground font-headline">{t('writingTools.documentWriter.generatedDocument')}</h3>
                  {generatedContent && (
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:shadow-soft transition-all duration-200">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[70vh] rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown components={markdownComponents}>{generatedContent}</ReactMarkdown>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
