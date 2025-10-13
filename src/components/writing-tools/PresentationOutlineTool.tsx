
'use client';

import { GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { usePresentationOutlineLogic } from '@/hooks';
import { Check, ChevronDown, ChevronRight, Copy, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

const OutlineItem = ({ item, level = 0 }: { item: GeneratePresentationOutlineOutput['outline'][0], level?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div style={{ paddingLeft: `${level * 1.5}rem` }}>
      <div className="flex items-center gap-2 py-1">
        {hasChildren ? (
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 -ml-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : <div className="w-6 h-6" />}
        <h4 className="font-semibold">{item.title}</h4>
      </div>
      {isOpen && (
        <div className="text-sm text-muted-foreground pl-8 border-l-2 ml-3">
          <p className="py-1">{item.content}</p>
          {hasChildren && item.children?.map((child, index) => <OutlineItem key={index} item={child} level={level + 1} />)}
        </div>
      )}
    </div>
  )
}

export function PresentationOutlineTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    results,
    isCopied,
    handleCopy,
  } = usePresentationOutlineLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.presentationOutline.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.presentationOutline.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="topic" className="font-headline">{t('writingTools.presentationOutline.topicLabel')}</Label>
                <Input
                  id="topic"
                  {...form.register('prompt')}
                  placeholder={t('writingTools.presentationOutline.topicPlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.prompt && <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="space-y-2">
                <Label htmlFor="documentation" className="font-headline">{t('writingTools.presentationOutline.documentationLabel')}</Label>
                <Textarea
                  id="documentation"
                  {...form.register('documentation')}
                  rows={8}
                  placeholder={t('writingTools.presentationOutline.documentationPlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.presentationOutline.generateButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || results) && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-2 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-muted-foreground font-headline">{t('writingTools.presentationOutline.generatedOutline')}</h3>
                  {results && (
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:shadow-soft transition-all duration-200">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[70vh] rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : results && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">{results.cover.title}</h3>
                      <div className="space-y-2">
                        {results.outline.map((item, index) => <OutlineItem key={index} item={item} />)}
                      </div>
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
