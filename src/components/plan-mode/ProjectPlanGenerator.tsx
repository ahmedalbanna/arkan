
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, GanttChartSquare, BrainCircuit, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import ProjectPlanViewer from './ProjectPlanViewer';
import { useBuilderStore } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import { useProjectPlanGenerator } from '@/hooks/use-project-plan-generator';


export default function ProjectPlanGenerator() {
  const { t, locale } = useLocalization();
  const { project } = useBuilderStore();
  const projectPlan = project?.projectPlan;
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
         {isPanelCollapsed && (
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
                <Button
                    variant="secondary"
                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                    onClick={() => setIsPanelCollapsed(false)}
                >
                    <PanelRightOpen className="h-5 w-5 mb-2" />
                    {t('builder.projectPlan.title')}
                </Button>
            </div>
        )}
      <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('builder.projectPlan.title')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleGetSuggestion()} disabled={!proposal || isProcessing}>
                    <BrainCircuit className="me-2 h-4 w-4" />
                    {t('builder.projectPlan.aiSuggest')}
                </Button>
                 <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setIsPanelCollapsed(true)}>
                  <PanelLeftOpen className="me-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>{t('builder.projectPlan.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="plan-description">{t('builder.projectPlan.projectDescriptionLabel')}</Label>
                <Textarea
                    id="plan-description"
                    placeholder={t('builder.projectPlan.projectDescriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    disabled={isProcessing}
                    className='h-fit rounded'
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="plan-deliverables">{t('builder.projectPlan.keyDeliverablesLabel')}</Label>
                <Textarea
                    id="plan-deliverables"
                    placeholder={t('builder.projectPlan.keyDeliverablesPlaceholder')}
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    rows={4}
                    disabled={isProcessing}
                    className='h-fit rounded'
                />
            </div>
            <Button onClick={handleGeneratePlan} disabled={!canGenerate} className="w-full">
              {planGenerationMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
              {t('builder.projectPlan.generateButton', { creditCost })}
            </Button>
          </CardContent>
        </Card>
      </div>
       <div className={cn("lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
        {planGenerationMutation.isPending && (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <p>{t('builder.projectPlan.generatingToast')}</p>
            </div>
          </Card>
        )}
        {!planGenerationMutation.isPending && projectPlan ? (
          <ProjectPlanViewer projectPlan={projectPlan} />
        ) : (
          !planGenerationMutation.isPending && (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8">
                <GanttChartSquare className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{t('builder.projectPlan.emptyStateTitle')}</h3>
                <p>{t('builder.projectPlan.emptyStateDescription')}</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
