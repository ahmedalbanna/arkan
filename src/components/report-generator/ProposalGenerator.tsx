
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useReportState } from '@/context/ReportStateContext';

export const ProposalGenerator = () => {
  const { dispatch } = useReportState();
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
                if (parsedState.proposal) {
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
        <CardTitle className="font-headline text-xl">Load Existing Project</CardTitle>
        <CardDescription>Upload a previously saved project file to continue working.</CardDescription>
      </CardHeader>
      <CardContent>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
        />
        <Button onClick={handleImportClick} variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Project File (.json)
        </Button>
      </CardContent>
    </Card>
  );
};
