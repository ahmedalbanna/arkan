
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportState } from '@/context/ReportStateContext';

export const ProposalGenerator = () => {
  const { 
    isGeneratingProposal, 
    projectIdea, 
    handleProjectIdeaChange, 
    handleGenerateProposal,
    state
  } = useReportState();
  const { t } = useLocalization();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('reportGenerator.step1Title')}</CardTitle>
        <CardDescription>{t('reportGenerator.step1Desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={t('reportGenerator.step1Placeholder')}
          rows={5}
          required
          value={projectIdea}
          onChange={(e) => handleProjectIdeaChange(e.target.value)}
          disabled={isGeneratingProposal}
        />
        {state.error && <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateProposal} disabled={isGeneratingProposal || !projectIdea}>
          {isGeneratingProposal ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isGeneratingProposal ? t('reportGenerator.step1ButtonLoading') : t('reportGenerator.step1Button')}
        </Button>
      </CardFooter>
    </Card>
  );
};
