
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useEvaluationTools } from '@/hooks';

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
        <div>
            <Textarea
                name="acceptanceCriteria"
                placeholder={t('builder.reportGenerator.criteriaPlaceholder')}
                rows={6}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                disabled={mutation.isPending}
            />
        </div>
        <div className="flex gap-2">
            <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={mutation.isPending || isProcessingPdf} className="text-xs" />
            <Button type="button" size="sm" onClick={handleProcessPdf} disabled={!pdfFile || mutation.isPending || isProcessingPdf}>
                {isProcessingPdf ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <FileText className="me-2 h-4 w-4"/>}
                {t('builder.reportGenerator.processPdf')}
            </Button>
        </div>
         <Button
            type="submit"
            disabled={mutation.isPending || !criteria}
            className="w-full font-headline"
        >
        {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle className="me-2 h-4 w-4" />}
        {t('builder.reportGenerator.evaluateReport')}
        </Button>
    </form>
  );
};
