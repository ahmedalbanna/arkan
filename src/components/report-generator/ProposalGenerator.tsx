
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { useHistory } from '@/hooks/use-history';
import type { ProjectProposal } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { getFromCache, saveToCache, generateCacheKey } from '@/lib/cache';
import { useToast } from '@/hooks/use-toast';

interface ProposalGeneratorProps {
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  projectIdea: string;
  onProjectIdeaChange: (idea: string) => void;
  onProposalGenerated: (proposal: ProjectProposal) => void;
  onReset: () => void;
}

export const ProposalGenerator = ({ isGenerating, setIsGenerating, projectIdea, onProjectIdeaChange, onProposalGenerated, onReset }: ProposalGeneratorProps) => {
  const { t } = useLocalization();
  const [error, setError] = useState<string | undefined>();
  const { agents } = useAgents();
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();

  const proposalAgent = agents.find(a => a.id === 'generate-proposal');

  const handleGenerateClick = async () => {
    if (!projectIdea || !proposalAgent) return;
    setIsGenerating(true);
    setError(undefined);

    const cacheKeyPayload = {
      projectIdea,
      prompt: proposalAgent.prompt,
    };
    const cacheKey = await generateCacheKey(cacheKeyPayload);
    const cachedResult = getFromCache<ProjectProposal>(cacheKey);

    if (cachedResult) {
      toast({
        title: "Loaded from Cache",
        description: `The proposal for "${cachedResult.title}" was retrieved from the local cache.`,
      });
      onReset();
      addHistoryEntry({
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: 'proposal',
        title: `Project Proposal: ${cachedResult.title}`,
        proposal: cachedResult,
      });
      onProposalGenerated(cachedResult);
      setIsGenerating(false);
      return;
    }

    try {
      onReset();
      const result = await generateProposal({
        projectIdea,
        prompt: proposalAgent.prompt,
      });

      saveToCache(cacheKey, result);

      addHistoryEntry({
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: 'proposal',
        title: `Project Proposal: ${result.title}`,
        proposal: result,
      });
      onProposalGenerated(result);
    } catch (e) {
      console.error(e);
      setError(t('reportGenerator.step1Error'));
    } finally {
      setIsGenerating(false);
    }
  };

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
          onChange={(e) => onProjectIdeaChange(e.target.value)}
          disabled={isGenerating}
        />
        {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateClick} disabled={isGenerating || !proposalAgent?.isEnabled}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? t('reportGenerator.step1ButtonLoading') : t('reportGenerator.step1Button')}
        </Button>
      </CardFooter>
    </Card>
  );
};
