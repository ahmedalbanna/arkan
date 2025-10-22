
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocalization } from '@/context/LocalizationContext';
import type { ContextFileData } from '@/lib/models/context-manager';
import { Loader2, PanelLeftOpen, Sparkles } from 'lucide-react';
import { AcademicUploaders } from './AcademicUploaders';

interface ControlPanelProps {
    onCollapse: () => void;
    documentType: 'exam' | 'homework' | null;
    setDocumentType: (type: 'exam' | 'homework') => void;
    isProcessing: boolean;
    addQuestionDocument: (fileName: string, content: string) => void;
    removeQuestionDocument: (index: number) => void;
    questionDocuments: ContextFileData[];
    addExternalContext: (fileName: string, content: string) => void;
    removeExternalContext: (index: number) => void;
    externalContext: ContextFileData[];
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
        <Card className="h-full flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline">{t('builder.academicSolver.uploadCardTitle')}</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:inline-flex hover:shadow-soft transition-all duration-200"
                        onClick={onCollapse}
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow overflow-y-auto pr-2">
                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <RadioGroup
                        value={documentType || undefined}
                        onValueChange={(value) => setDocumentType(value as 'exam' | 'homework')}
                        className="grid grid-cols-2 gap-4"
                        disabled={isProcessing}
                    >
                        <div>
                            <RadioGroupItem value="exam" id="exam" className="peer sr-only" />
                            <Label htmlFor="exam" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm p-4 hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-gradient-to-r peer-data-[state=checked]:from-primary peer-data-[state=checked]:to-primary-600 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary transition-all duration-200">
                                {t('builder.academicSolver.examType')}
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="homework" id="homework" className="peer sr-only" />
                            <Label htmlFor="homework" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm p-4 hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-gradient-to-r peer-data-[state=checked]:from-primary peer-data-[state=checked]:to-primary-600 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary transition-all duration-200">
                                {t('builder.academicSolver.homeworkType')}
                            </Label>
                        </div>
                    </RadioGroup>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <AcademicUploaders
                        title={t('builder.academicSolver.questionsDocument')}
                        onContentAdded={addQuestionDocument}
                        onContentRemoved={removeQuestionDocument}
                        isProcessing={isProcessing}
                        uploadedContent={questionDocuments}
                    />
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <AcademicUploaders
                        title={t('builder.academicSolver.contextSyllabus')}
                        onContentAdded={addExternalContext}
                        onContentRemoved={removeExternalContext}
                        isProcessing={isProcessing}
                        uploadedContent={externalContext}
                    />
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={500}>
                    <Button
                        onClick={handleAnalyze}
                        disabled={!canAnalyze}
                        variant="gradient"
                        className="w-full hover:shadow-glow transition-all duration-200"
                    >
                        {isAnalyzing ? (
                            <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="me-2 h-4 w-4" />
                        )}
                        {t('builder.academicSolver.analyzeButton')}
                    </Button>
                </AnimatedContainer>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-muted/30 to-primary/5">
                <AnimatedContainer animation="fade-in-up" delay={600}>
                    <Button
                        onClick={resetCurrent}
                        variant="outline"
                        className="w-full hover:shadow-soft transition-all duration-200"
                    >
                        {t('builder.academicSolver.newSession')}
                    </Button>
                </AnimatedContainer>
            </CardFooter>
        </Card>
    );
}
