
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiagramGenerator } from '@/hooks';
import { cn } from '@/lib/utils';
import { GitGraph, Loader2, PanelRightOpen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { DiagramGenerationTools } from './DiagramGenerationTools';
import DiagramViewer from './DiagramViewer';

function DiagramSkeleton() {
  return (
    <AnimatedContainer animation="fade-in-up" delay={0}>
      <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
              <GitGraph className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2 bg-gradient-to-r from-muted to-muted/80" />
              <Skeleton className="h-4 w-64 bg-gradient-to-r from-muted to-muted/80" />
            </div>
            <Badge variant="secondary" className="shadow-soft">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Generating
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg bg-gradient-to-r from-muted to-muted/80" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gradient-to-r from-muted to-muted/80" />
            <Skeleton className="h-4 w-5/6 bg-gradient-to-r from-muted to-muted/80" />
            <Skeleton className="h-4 w-4/6 bg-gradient-to-r from-muted to-muted/80" />
          </div>
          <EnhancedProgress
            value={75}
            variant="gradient"
            indicatorVariant="shimmer"
            size="lg"
            className="mt-4"
          />
        </CardContent>
      </Card>
    </AnimatedContainer>
  )
}

export default function DiagramGenerator() {
  const {
    t,
    locale,
    diagramSections,
    diagrams,
    handleDiagramCodeUpdate,
    setDiagramExplanation,
    mutation,
    handleUpdateDiagram,
    generatedDiagrams,
  } = useDiagramGenerator();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  return (
    <div className="relative h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Collapsed Panel Button */}
        {isPanelCollapsed && (
          <AnimatedContainer animation="fade-in-left" delay={0}>
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
              <Card variant="glass" className="p-2 backdrop-blur-md">
                <Button
                  variant="secondary"
                  className="h-auto p-3 rounded-lg w-full flex flex-col items-center gap-2 hover:shadow-glow transition-all duration-200"
                  onClick={() => setIsPanelCollapsed(false)}
                >
                  <PanelRightOpen className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">
                    {t('builder.diagramGenerator.toolsTitle')}
                  </span>
                </Button>
              </Card>
            </div>
          </AnimatedContainer>
        )}

        {/* Tools Panel */}
        <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">Diagram Tools</CardTitle>
                    <CardDescription className="text-sm">Configure your diagrams</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <DiagramGenerationTools onCollapseToggle={() => setIsPanelCollapsed(true)} />
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>


        {/* Main Content */}
        <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
          <AnimatedContainer animation="fade-in-up" delay={400}>
            <Card variant="glass" className="h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                    <GitGraph className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-headline">{t('builder.diagramGenerator.title')}</CardTitle>
                    <CardDescription className="text-sm">{t('builder.diagramGenerator.description')}</CardDescription>
                  </div>
                  {generatedDiagrams && generatedDiagrams.length > 0 && (
                    <Badge variant="secondary" className="shadow-soft">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generated
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-full">
                {generatedDiagrams.length > 0 ? (
                  <Accordion type="multiple" className="w-full space-y-4">
                    {generatedDiagrams.map((key, index) => {
                      const diagramData = diagrams![key];
                      const agent = diagramSections[key];
                      if (!diagramData || !agent) return null;
                      return (
                        <AnimatedContainer key={key} animation="fade-in-up" delay={index * 100}>
                          <AccordionItem value={key} className="bg-gradient-to-r from-background/50 to-primary/5 rounded-lg border shadow-soft hover:shadow-glow transition-all duration-200">
                            <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <div className="p-1 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                                  <GitGraph className="h-4 w-4 text-white" />
                                </div>
                                {agent.name}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border-t bg-gradient-to-r from-muted/30 to-primary/5">
                              <DiagramViewer
                                diagramKey={key}
                                diagramData={diagramData}
                                onCodeChange={(code) => handleDiagramCodeUpdate(key, code)}
                                onUpdate={() => handleUpdateDiagram(diagramData.plantUmlCode)}
                                onExplanationSave={(explanation) => setDiagramExplanation(key, explanation)}
                                isUpdating={mutation.isPending && mutation.variables === diagramData.plantUmlCode}
                                isReadOnly={mutation.isPending}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </AnimatedContainer>
                      )
                    })}
                  </Accordion>
                ) : (
                  <AnimatedContainer animation="fade-in-up" delay={500}>
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center p-8">
                        <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-4 shadow-soft">
                          <GitGraph className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 font-headline">No Diagrams Generated</h3>
                        <p className="text-muted-foreground">{t('builder.diagramGenerator.emptyState')}</p>
                      </div>
                    </div>
                  </AnimatedContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

      </div>
    </div>
  );
}
