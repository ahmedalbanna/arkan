
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEvaluationTools } from '@/hooks';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';

export const EvaluationTools = () => {
    const {
        t,
        criteria,
        setCriteria,
        pdfFile,
        isProcessingPdf,
        mutation,
        handleFileChange,
        handleProcessPdf,
        handleSubmit,
    } = useEvaluationTools();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div>
                <Textarea
                    name="acceptanceCriteria"
                    placeholder={t('builder.reportGenerator.criteriaPlaceholder')}
                    rows={6}
                    value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                    disabled={mutation.isPending}
                    className="hover:shadow-soft transition-all duration-200"
                />
            </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={300}>
            <div className="flex gap-2">
                <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={mutation.isPending || isProcessingPdf}
                    className="text-xs hover:shadow-soft transition-all duration-200"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={handleProcessPdf}
                    disabled={!pdfFile || mutation.isPending || isProcessingPdf}
                    className="hover:shadow-soft transition-all duration-200"
                >
                    {isProcessingPdf ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <FileText className="me-2 h-4 w-4"/>}
                    {t('builder.reportGenerator.processPdf')}
                </Button>
            </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={400}>
            <Button
                type="submit"
                disabled={mutation.isPending || !criteria}
                className="w-full font-headline hover:shadow-glow transition-all duration-200"
                variant="gradient"
            >
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle className="me-2 h-4 w-4" />}
                {t('builder.reportGenerator.evaluateReport')}
            </Button>
        </AnimatedContainer>
    </form>
  );
};
