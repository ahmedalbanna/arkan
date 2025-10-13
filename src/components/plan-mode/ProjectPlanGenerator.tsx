
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useProjectPlanGenerator } from '@/hooks/use-project-plan-generator';
import { BrainCircuit, Clock, GanttChartSquare, Loader2, Sparkles, Target, Zap } from 'lucide-react';
import ProjectPlanViewer from './ProjectPlanViewer';


export default function ProjectPlanGenerator() {
  const { t, locale } = useLocalization();
  const { project } = useBuilderStore();
  const projectPlan = project?.projectPlan;

  const {
    description,
    setDescription,
    deliverables,
    setDeliverables,
    handleGeneratePlan,
    handleGetSuggestion,
    planGenerationMutation,
    isProcessing,
    canGenerate,
    creditCost,
    proposal,
  } = useProjectPlanGenerator();


  return (
    <div className="relative h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-soft">
                      <GanttChartSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-headline">{t('builder.projectPlan.title')}</CardTitle>
                      <CardDescription className="text-sm">{t('builder.projectPlan.description')}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGetSuggestion()}
                    disabled={!proposal || isProcessing}
                    className="hover:shadow-soft transition-all duration-200"
                  >
                    <BrainCircuit className="me-2 h-4 w-4" />
                    {t('builder.projectPlan.aiSuggest')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                  <div className="space-y-2">
                    <Label htmlFor="plan-description" className="flex items-center gap-2 font-headline">
                      <Target className="h-4 w-4" />
                      {t('builder.projectPlan.projectDescriptionLabel')}
                    </Label>
                    <Textarea
                      id="plan-description"
                      placeholder={t('builder.projectPlan.projectDescriptionPlaceholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      disabled={isProcessing}
                      className='h-fit rounded resize-none hover:shadow-soft transition-all duration-200'
                    />
                  </div>
                </AnimatedContainer>
                <AnimatedContainer animation="fade-in-up" delay={400}>
                  <div className="space-y-2">
                    <Label htmlFor="plan-deliverables" className="flex items-center gap-2 font-headline">
                      <Zap className="h-4 w-4" />
                      {t('builder.projectPlan.keyDeliverablesLabel')}
                    </Label>
                    <Textarea
                      id="plan-deliverables"
                      placeholder={t('builder.projectPlan.keyDeliverablesPlaceholder')}
                      value={deliverables}
                      onChange={(e) => setDeliverables(e.target.value)}
                      rows={4}
                      disabled={isProcessing}
                      className='h-fit rounded resize-none hover:shadow-soft transition-all duration-200'
                    />
                  </div>
                </AnimatedContainer>

                {/* Generation Progress */}
                {isProcessing && (
                  <AnimatedContainer animation="fade-in-up" delay={500}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        </div>
                        <span className="text-sm font-medium">Generating Plan...</span>
                      </div>
                      <EnhancedProgress
                        value={75}
                        variant="gradient"
                        indicatorVariant="shimmer"
                        size="lg"
                      />
                    </div>
                  </AnimatedContainer>
                )}

                <AnimatedContainer animation="fade-in-up" delay={600}>
                  <Button
                    onClick={handleGeneratePlan}
                    disabled={!canGenerate}
                    className="w-full hover:shadow-glow transition-all duration-200"
                    variant="gradient"
                  >
                    {planGenerationMutation.isPending ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        {t('builder.projectPlan.generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="me-2 h-4 w-4" />
                        {t('builder.projectPlan.generateButton', { creditCost })}
                      </>
                    )}
                  </Button>
                </AnimatedContainer>

                {/* Credit Cost Info */}
                {creditCost > 0 && (
                  <AnimatedContainer animation="fade-in-up" delay={700}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Credit Cost:</span>
                      </div>
                      <Badge variant="secondary" className="shadow-soft">{creditCost} credits</Badge>
                    </div>
                  </AnimatedContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>


        {/* Plan Viewer */}
        <div className="lg:col-span-8 lg:overflow-y-auto lg:pr-2">
          <AnimatedContainer animation="fade-in-up" delay={400}>
            {planGenerationMutation.isPending && (
              <Card variant="glass" className="flex items-center justify-center h-full min-h-[400px] backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <div className="text-center p-8">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mb-4 shadow-soft">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-headline">Generating Plan</h3>
                  <p className="text-muted-foreground">{t('builder.projectPlan.generatingToast')}</p>
                  <EnhancedProgress
                    value={75}
                    variant="gradient"
                    indicatorVariant="shimmer"
                    size="lg"
                    className="mt-4 w-64 mx-auto"
                  />
                </div>
              </Card>
            )}
            {!planGenerationMutation.isPending && projectPlan ? (
              <Card variant="glass" className="h-full backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                      <GanttChartSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-headline">Project Plan</CardTitle>
                      <CardDescription>Visual timeline and milestones</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-auto shadow-soft">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-full p-4 sm:p-6">
                  <ProjectPlanViewer projectPlan={projectPlan} />
                </CardContent>
              </Card>
            ) : (
              !planGenerationMutation.isPending && (
                <Card variant="glass" className="flex items-center justify-center h-full min-h-[400px] backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                  <div className="text-center p-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft">
                      <GanttChartSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-headline">{t('builder.projectPlan.emptyStateTitle')}</h3>
                    <p className="text-muted-foreground">{t('builder.projectPlan.emptyStateDescription')}</p>
                  </div>
                </Card>
              )
            )}
          </AnimatedContainer>
        </div>

      </div>
    </div>
  );
}
