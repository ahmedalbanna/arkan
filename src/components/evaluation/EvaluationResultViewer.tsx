
'use client';

import type { EvaluateReportOutput } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
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
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                    <div className={`p-2 rounded-lg shadow-soft ${getScoreColor(evaluation.evaluationScore)}`}>
                        {getScoreIcon(evaluation.evaluationScore)}
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium font-headline">{t('builder.reportGenerator.qualityScore')}</span>
                            <span className={`font-bold text-lg font-headline ${getScoreColor(evaluation.evaluationScore)}`}>
                                {evaluation.evaluationScore} / 100
                            </span>
                        </div>
                        <Progress value={evaluation.evaluationScore} className="h-2 shadow-soft" />
                    </div>
                </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={300}>
                <div className="space-y-2 p-4 border rounded-lg bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                    <h4 className="font-semibold font-headline">{t('builder.reportGenerator.summaryAndFeedback')}</h4>
                    <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
                    <ul className="space-y-4 text-sm list-none pt-4 mt-4 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                        {evaluation.feedback.map((item, index) => {
                            const StatusIcon = getFeedbackStatusInfo(item.status).icon;
                            const statusColor = getFeedbackStatusInfo(item.status).color;
                            return (
                                <AnimatedContainer key={index} animation="fade-in-up" delay={400 + (index * 100)}>
                                    <li className="flex flex-col items-start gap-2 border-b pb-3 last:border-b-0 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 hover:shadow-soft transition-all duration-200 rounded-md p-2">
                                        <div className="flex items-start gap-2 w-full">
                                            <div className={`p-1 rounded-lg shadow-soft ${statusColor}`}>
                                                <StatusIcon className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="flex-grow font-headline">{item.point}</span>
                                        </div>
                                        {item.solution && item.sectionKey && (
                                            <div className="pl-6 w-full">
                                                <div className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-sm border border-dashed shadow-soft hover:shadow-glow transition-all duration-200">
                                                    <p className="text-xs text-muted-foreground flex-grow italic">&quot;{item.solution}&quot;</p>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleFixWithAi(item.sectionKey!, item.solution!)}
                                                        disabled={generationMutation.isPending && generationMutation.variables?.body.sectionToGenerate === item.sectionKey}
                                                        className="hover:shadow-soft transition-all duration-200"
                                                    >
                                                        <Wand2 className="me-2 h-4 w-4" />
                                                        {t('builder.reportGenerator.fixWithAi')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                </AnimatedContainer>
                            )
                        })}
                    </ul>
                </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
                <div className="pt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setEvaluation(null)} className="hover:shadow-soft transition-all duration-200">
                        <RefreshCw className="me-2 h-4 w-4" />
                        {t('builder.reportGenerator.reevaluate')}
                    </Button>
                </div>
            </AnimatedContainer>
        </div>
    );
}
