'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, PanelLeftOpen } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AcademicUploaders } from './AcademicUploaders';
import type { ExternalContext } from '@/hooks';

interface ControlPanelProps {
    onCollapse: () => void;
    documentType: 'exam' | 'homework' | null;
    setDocumentType: (type: 'exam' | 'homework') => void;
    isProcessing: boolean;
    addQuestionDocument: (fileName: string, content: string) => void;
    removeQuestionDocument: (index: number) => void;
    questionDocuments: ExternalContext[];
    addExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: (index: number) => void;
    externalContext: ExternalContext[];
    handleAnalyze: () => void;
    canAnalyze: boolean;
    isAnalyzing: boolean;
    resetCurrent: () => void;
}

export function ControlPanel({
    onCollapse,
    documentType,
    setDocumentType,
    isProcessing,
    addQuestionDocument,
    removeQuestionDocument,
    questionDocuments,
    addExternalContext,
    removeExternalContext,
    externalContext,
    handleAnalyze,
    canAnalyze,
    isAnalyzing,
    resetCurrent,
}: ControlPanelProps) {
    const { t } = useLocalization();

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{t('builder.academicSolver.uploadCardTitle')}</CardTitle>
                    <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapse}>
                        <PanelLeftOpen className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow overflow-y-auto pr-2">
                <RadioGroup
                    value={documentType || undefined}
                    onValueChange={(value) => setDocumentType(value as 'exam' | 'homework')}
                    className="grid grid-cols-2 gap-4"
                    disabled={isProcessing}
                >
                    <div>
                        <RadioGroupItem value="exam" id="exam" className="peer sr-only" />
                        <Label htmlFor="exam" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            {t('builder.academicSolver.examType')}
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="homework" id="homework" className="peer sr-only" />
                        <Label htmlFor="homework" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            {t('builder.academicSolver.homeworkType')}
                        </Label>
                    </div>
                </RadioGroup>

                <AcademicUploaders
                    title={t('builder.academicSolver.questionsDocument')}
                    onContentAdded={addQuestionDocument}
                    onContentRemoved={removeQuestionDocument}
                    isProcessing={isProcessing}
                    uploadedContent={questionDocuments}
                    isContext={false}
                />

                <AcademicUploaders
                    title={t('builder.academicSolver.contextSyllabus')}
                    onContentAdded={addExternalContext}
                    onContentRemoved={removeExternalContext}
                    isProcessing={isProcessing}
                    uploadedContent={externalContext}
                    isContext
                />

                <Button onClick={handleAnalyze} disabled={!canAnalyze} className="w-full">
                    {isAnalyzing ? (
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="me-2 h-4 w-4" />
                    )}
                    {t('builder.academicSolver.analyzeButton')}
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={resetCurrent} variant="outline" className="w-full">{t('builder.academicSolver.newSession')}</Button>
            </CardFooter>
        </Card>
    );
}
