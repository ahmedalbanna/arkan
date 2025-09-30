
'use client';

import type { EvaluateReportOutput } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEvaluationResultViewer } from '@/hooks';
import { RefreshCw, Wand2 } from 'lucide-react';

interface EvaluationResultViewerProps {
    evaluation: EvaluateReportOutput;
}

export function EvaluationResultViewer({ evaluation }: EvaluationResultViewerProps) {
    const {
        t,
        setEvaluation,
        generationMutation,
        handleFixWithAi,
        getScoreColor,
        getScoreIcon,
        getFeedbackStatusInfo,
    } = useEvaluationResultViewer();

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
                    <Progress value={evaluation.evaluationScore} className="h-2" />
                </div>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">{t('builder.reportGenerator.summaryAndFeedback')}</h4>
                <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
                <ul className="space-y-4 text-sm list-none pt-4 mt-4 border-t">
                    {evaluation.feedback.map((item, index) => {
                        const StatusIcon = getFeedbackStatusInfo(item.status).icon;
                        const statusColor = getFeedbackStatusInfo(item.status).color;
                        return (
                            <li key={index} className="flex flex-col items-start gap-2 border-b pb-3 last:border-b-0">
                                <div className="flex items-start gap-2 w-full">
                                    <StatusIcon className={`h-4 w-4 mt-1 shrink-0 ${statusColor}`} />
                                    <span className="flex-grow">{item.point}</span>
                                </div>
                                {item.solution && item.sectionKey && (
                                    <div className="pl-6 w-full">
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-background border border-dashed">
                                            <p className="text-xs text-muted-foreground flex-grow italic">"{item.solution}"</p>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleFixWithAi(item.sectionKey!, item.solution!)}
                                                disabled={generationMutation.mutation.isPending && generationMutation.mutation.variables?.body.sectionToGenerate === item.sectionKey}
                                            >
                                                <Wand2 className="me-2 h-4 w-4" />
                                                {t('builder.reportGenerator.fixWithAi')}
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
                    <RefreshCw className="me-2 h-4 w-4" />
                    {t('builder.reportGenerator.reevaluate')}
                </Button>
            </div>
        </div>
    );
}
