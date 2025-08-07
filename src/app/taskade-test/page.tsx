
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, PlayCircle, Clock } from 'lucide-react';
import { useTaskadeGeneration } from '@/hooks/use-taskade';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Label } from '@/components/ui/label';

export default function TaskadeTestPage() {
  const [inputContent, setInputContent] = useState('Translate the following text to Arabic: "Hello, World!"');
  const { startGeneration, status, result, error, jobId } = useTaskadeGeneration();

  const handleStart = () => {
    let content: string | object;
    try {
      // Try to parse the input as JSON
      content = JSON.parse(inputContent);
    } catch (e) {
      // If it fails, treat it as a plain string
      content = inputContent;
    }
    startGeneration(content);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Asynchronous Task Test</CardTitle>
          <CardDescription>
            This page tests the asynchronous workflow with a backend service. Enter a prompt and start the generation. The result will appear below when ready without polling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-input">Your Prompt (String or JSON)</Label>
            <Textarea
              id="prompt-input"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              rows={5}
              placeholder='e.g., "Translate..." or { "action": "summarize", "text": "..." }'
              disabled={status === 'pending'}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleStart} disabled={status === 'pending' || !inputContent.trim()}>
            {status === 'pending' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            Start Generation Task
          </Button>

          <div className="p-4 border rounded-lg bg-muted min-h-[150px]">
            <h3 className="font-semibold mb-2">Status</h3>
            {status === 'idle' && <p className="text-sm text-muted-foreground">Click the button to start a task.</p>}
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
