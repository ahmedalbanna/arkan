
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
// import { Progress } from '@/components/ui/progress';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { usePlagiarismCheck } from '@/hooks/use-writing-tools';
import { toast } from '@/hooks/use-toast';
import { PlagiarismCheckOutput } from '@/services/writing-tools-service';

const plagiarismSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for an effective check.'),
});

type PlagiarismFormValues = z.infer<typeof plagiarismSchema>;

export function PlagiarismCheckerTool() {
  const mutation = usePlagiarismCheck();

  const form = useForm<PlagiarismFormValues>({
    resolver: zodResolver(plagiarismSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = async (data: PlagiarismFormValues) => {
    mutation.mutate({ text: data.text }, {
      onError: (error) => {
        toast({ title: 'Plagiarism Check Failed', description: error.message, variant: 'destructive' });
      }
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score < 25) return 'text-destructive';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const results = mutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plagiarism Checker</CardTitle>
        <CardDescription>Enter your text below to check it for potential plagiarism and ensure its originality.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-check">Your Text</Label>
            <Textarea
              id="text-to-check"
              {...form.register('text')}
              rows={12}
              placeholder="Paste your article, essay, or any text here..."
              className="resize-none"
              disabled={mutation.isPending}
            />
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Check for Plagiarism
          </Button>
        </form>

        {mutation.isPending && (
            // Note: The actual checking is handled by the backend. This spinner is just to show progress.
            // A real plagiarism checker would likely involve polling the server or using websockets for
            // progress updates if the check takes significant time. For this example, we just show
            // a simple loading state.


            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking against billions of sources...
                </div>
            </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">Plagiarism Report</h3>
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center justify-center text-center gap-4">
                     <div className={`text-6xl font-bold ${getScoreColor(results.originalityScore)}`}>
                        {results.originalityScore}%
                    </div>
                    <div>
                        <p className="font-semibold">Originality Score</p>
                        <p className="text-xs text-muted-foreground">This score represents the percentage of your text that is unique.</p>
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-2">
              <h4 className="font-semibold">Potential Matches Found</h4>
              <p className="text-sm text-muted-foreground">
                We found potential matches from the following sources. Review them to ensure proper citation.
              </p>
              <div className="border rounded-lg">
                {results.matches.length > 0 ? results.matches.map((result: PlagiarismCheckOutput['matches'][0], index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div className="flex-grow truncate mr-4">
                        <Link href={`https://${result.source}`} target="_blank" className="text-sm font-medium hover:underline flex items-center gap-1">
                            {result.source} <ExternalLink className="inline h-3 w-3" />
                        </Link>
                    </div>
                    <Badge variant={result.similarity > 75 ? 'destructive' : result.similarity > 50 ? 'secondary' : 'outline'}>
                      {result.similarity}% Match
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground p-4">
                    <p>No direct matches found. The content appears to be original.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
