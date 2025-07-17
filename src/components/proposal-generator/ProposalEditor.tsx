'use client';

import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';

interface ProposalEditorProps {
  proposalJson: string;
  onProposalJsonChange: (json: string) => void;
  isDisabled: boolean;
  error?: string;
}

export const ProposalEditor = ({ proposalJson, onProposalJsonChange, isDisabled, error }: ProposalEditorProps) => {
  const { t } = useLocalization();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex leading-relaxed">{t('reportGenerator.step2Title')}</CardTitle>
        <CardDescription>{t('reportGenerator.step2Desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          name="proposalJson"
          placeholder='{ "title": "...", "objective": "...", ... }'
          rows={15}
          required
          value={proposalJson}
          onChange={(e) => onProposalJsonChange(e.target.value)}
          disabled={isDisabled}
          className="font-mono text-xs"
          dir="ltr"
        />
        {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
};
