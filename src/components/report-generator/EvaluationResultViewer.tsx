
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { CheckCircle, Frown, Meh, Smile, AlertTriangle, XCircle, Wand2, RefreshCw } from 'lucide-react';
import type { EvaluateReportOutput } from '@/ai/flows/evaluate-report';
import { useReportStore } from '@/hooks/useReportStore';

interface EvaluationResultViewerProps {
    evaluation: EvaluateReportOutput;
}

const getScoreColor = (score: number) => {
    if (score < 50) return 'text-destructive';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
}

const getScoreIcon = (score: number) => {
    if (score < 50) return <Frown className="h-10 w-10" />;
    if (score < 75) return <Meh className="h-10 w-10" />;
    return <Smile className="h-10 w-10" />;
}

const getFeedbackStatusInfo = (status: "Acceptable" | "Weak" | "Not Present") => {
  switch (status) {
    case 'Acceptable':
      return { icon: CheckCircle, color: 'text-green-500' };
    case 'Weak':
      return { icon: AlertTriangle, color: 'text-yellow-500' };
    case 'Not Present':
      return { icon: XCircle, color: 'text-destructive' };
    default:
      return { icon: CheckCircle, color: 'text-muted-foreground' };
  }
};

export function EvaluationResultViewer({ evaluation }: EvaluationResultViewerProps) {
    const { t } = useLocalization();
    const { setEvaluation } = useReportStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className={getScoreColor(evaluation.evaluationScore)}>
                    {getScoreIcon(evaluation.evaluationScore)}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{t('builder.reportGenerator.qualityScore')}</span>
                        <span className={`font-bold text-lg ${getScoreColor(evaluation.evaluationScore)}`}>
                            {evaluation.evaluationScore} / 100
                        </span>
                    </div>
                    <Progress value={evaluation.evaluationScore} className="h-2"/>
                </div>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">Summary & Feedback</h4>
                <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
                <ul className="space-y-4 text-sm list-none pl-0">
                    {evaluation.feedback.map((item, index) => {
                      const StatusIcon = getFeedbackStatusInfo(item.status).icon;
                      const statusColor = getFeedbackStatusInfo(item.status).color;
                      return (
                        <li key={index} className="flex flex-col items-start gap-2 border-b pb-3 last:border-b-0">
                            <div className="flex items-start gap-2 w-full">
                                <StatusIcon className={`h-4 w-4 mt-1 shrink-0 ${statusColor}`}/>
                                <span className="flex-grow">{item.point}</span>
                            </div>
                            {item.solution && (
                                <div className="pl-6 w-full">
                                    <div className="flex items-center gap-2 p-2 rounded-md bg-background border border-dashed">
                                        <p className="text-xs text-muted-foreground flex-grow italic">"{item.solution}"</p>
                                        <Button size="sm" variant="secondary" onClick={() => toast({title: "Coming Soon!", description: "This will automatically apply the suggested fix."})}>
                                            <Wand2 className="mr-2 h-4 w-4"/>
                                            Fix with AI
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </li>
                      )
                    })}
                </ul>
            </div>
            <div className="pt-4 flex justify-end">
                <Button variant="outline" onClick={() => setEvaluation(null)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-evaluate
                </Button>
            </div>
        </div>
    );
}
