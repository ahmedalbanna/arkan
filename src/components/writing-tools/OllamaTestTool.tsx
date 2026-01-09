
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOllamaTestTool } from '@/hooks/writing-tools/use-ollama-test-tool';
import { Loader2, Server } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';

export function OllamaTestTool() {
  const { form, mutation, onSubmit, results } = useOllamaTestTool();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ollama Server Test</CardTitle>
        <CardDescription>Send a prompt directly to the Ollama server to test connectivity and generation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              {...form.register('prompt')}
              placeholder="e.g., Why is the sky blue?"
              rows={5}
              disabled={mutation.isPending}
            />
            {form.formState.errors.prompt && <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Server className="me-2 h-4 w-4" />}
            Send to Ollama
          </Button>
        </form>

        {(mutation.isPending || results) && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">Server Response</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                {mutation.isPending ? (
                  <div className="flex items-center justify-center min-h-[100px] text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : results ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <ReactMarkdown>{results.response}</ReactMarkdown>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2 border-t">Model: {results.model}</p>
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-center text-muted-foreground">No response received.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
