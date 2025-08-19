
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, PlayCircle, Clock } from 'lucide-react';
import { useTaskadeGeneration } from '@/hooks/use-taskade';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const initialInputs = {
    projectCategory: "Software Development",
    projectTitle: "AI-Powered Document Collaboration Platform",
    projectObjective: "To develop a platform that uses AI to assist in writing, editing, and managing technical documents, improving efficiency and quality.",
    projectMethodology: "Agile (Scrum)",
    projectExpectedOutcome: "A fully functional web application with real-time collaboration, AI writing suggestions, and version control.",
    projectTimeline: "6 months",
    projectBudget: "$150,000",
    projectStakeholders: "Project Manager, Lead Developer, UI/UX Designer, Client",
    projectRisks: "AI model integration complexity, potential for scope creep.",
    projectSuccessCriteria: "User adoption rate of 80% within the first year, reduction in document creation time by 30%.",
    projectEvaluation: "Bi-weekly sprint reviews and user feedback sessions."
};

export default function ProposalWebhookTestPage() {
  const [inputs, setInputs] = useState(initialInputs);
  const { startGeneration, status, result, error, jobId } = useTaskadeGeneration();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleStart = () => {
    startGeneration({
        featureId: 'generate-proposal-webhook',
        inputContent: inputs
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Taskade Proposal Generation Test</CardTitle>
          <CardDescription>
            This page tests the asynchronous proposal generation workflow via the specified Taskade webhook. Fill in the details and start the generation. The generated proposal will appear below when ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(initialInputs).map(key => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace('Project ', '')}</Label>
                        <Input
                            id={key}
                            name={key}
                            value={inputs[key as keyof typeof inputs]}
                            onChange={handleInputChange}
                            disabled={status === 'pending'}
                        />
                    </div>
                ))}
            </div>

          <Button onClick={handleStart} disabled={status === 'pending'} className="w-full">
            {status === 'pending' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            Generate Proposal via Webhook
          </Button>

          <div className="p-4 border rounded-lg bg-muted min-h-[150px]">
            <h3 className="font-semibold mb-2">Status</h3>
            {status === 'idle' && <p className="text-sm text-muted-foreground">Click the button to start the task.</p>}
            {status === 'pending' && (
              <div className="flex items-center gap-2 text-blue-500">
                <Clock className="h-5 w-5" />
                <p>Pending... Waiting for result. Job ID: {jobId}</p>
              </div>
            )}
            {status === 'completed' && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <p>Completed!</p>
              </div>
            )}
            {status === 'failed' && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Failed.</p>
              </div>
            )}

            {result && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Result:</h4>
                <pre className="p-2 bg-background rounded-md text-sm whitespace-pre-wrap">
                  <code>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</code>
                </pre>
              </div>
            )}
             {error && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2 text-destructive">Error:</h4>
                <pre className="p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                  <code>{error}</code>
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
