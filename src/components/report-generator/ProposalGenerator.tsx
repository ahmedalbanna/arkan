
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportState } from '@/context/ReportStateContext';
import { Separator } from '../ui/separator';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const ProposalGenerator = () => {
  const { 
    isGeneratingProposal, 
    projectIdea, 
    handleProjectIdeaChange, 
    handleGenerateProposal,
    dispatch,
    state
  } = useReportState();
  const { t } = useLocalization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        toast({ title: 'Invalid File Type', description: 'Please upload a valid .json project file.', variant: 'destructive' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            if (typeof content === 'string') {
                const parsedState = JSON.parse(content);
                // Basic validation
                if (parsedState.version && parsedState.proposal) {
                    dispatch({ type: 'SET_STATE', payload: parsedState });
                    toast({ title: 'Project Loaded', description: `Successfully loaded "${parsedState.proposal.title}".` });
                } else {
                    throw new Error('Invalid project file structure.');
                }
            }
        } catch (error) {
            console.error('Failed to load project file:', error);
            toast({ title: 'Load Failed', description: 'The selected file could not be read or is corrupted.', variant: 'destructive' });
        }
    };
    reader.readAsText(file);

    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

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
      <CardFooter className="flex-col items-start gap-4">
        <Button onClick={handleGenerateProposal} disabled={isGeneratingProposal || !projectIdea}>
          {isGeneratingProposal ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isGeneratingProposal ? t('reportGenerator.step1ButtonLoading') : t('reportGenerator.step1Button')}
        </Button>
        
        <div className="flex items-center w-full gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
        </div>

        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
        />
        <Button onClick={handleImportClick} variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Project File
        </Button>
      </CardFooter>
    </Card>
  );
};
