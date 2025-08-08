
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle, HelpCircle, XCircle, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { useFactCheck } from '@/hooks/use-writing-tools';
import { toast } from '@/hooks/use-toast';
import type { ClaimStatus, FactCheckOutput } from '@/ai/flows/fact-checker';

const factCheckerSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters for a thorough fact-check.'),
});

type FactCheckerFormValues = z.infer<typeof factCheckerSchema>;


export function FactCheckerTool() {
  const mutation = useFactCheck();
  
  const form = useForm<FactCheckerFormValues>({
    resolver: zodResolver(factCheckerSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = async (data: FactCheckerFormValues) => {
    mutation.mutate({ text: data.text }, {
      onError: (error) => {
        toast({ title: 'Fact-Check Failed', description: error.message, variant: 'destructive' });
      }
    });
  };
  
  const getStatusInfo = (status: ClaimStatus) => {
    switch (status) {
      case 'Verified':
        return { icon: CheckCircle, color: 'text-green-500', badgeVariant: 'default' as const };
      case 'Inconclusive':
        return { icon: HelpCircle, color: 'text-yellow-500', badgeVariant: 'secondary' as const };
      case 'False':
        return { icon: XCircle, color: 'text-destructive', badgeVariant: 'destructive' as const };
    }
  };
  
  const results = mutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Fact Checker</CardTitle>
        <CardDescription>Enter text containing claims, and the AI will attempt to verify them against reliable sources.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-check">Text to Fact-Check</Label>
            <Textarea
              id="text-to-check"
              {...form.register('text')}
              rows={12}
              placeholder="e.g., The first person to walk on the moon was Neil Armstrong..."
              className="resize-none"
              disabled={mutation.isPending}
            />
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Check Facts
          </Button>
        </form>

        {mutation.isPending && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing claims and searching for sources...
                </div>
            </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">Fact-Check Report</h3>
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center justify-center text-center gap-4">
                     <div className={`text-6xl font-bold ${getScoreColor(results.originalityScore)}`}>
                        {results.originalityScore}%
                    </div>
                    <div>
                        <p className="font-semibold">Originality & Accuracy Score</p>
                        <p className="text-xs text-muted-foreground">This score represents the factual accuracy of the text.</p>
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-2">
              <h4 className="font-semibold">Identified Claims</h4>
              {results.claims.length > 0 ? (
                <div className="space-y-4">
                    {results.claims.map((claim: FactCheckOutput['claims'][0], index: number) => {
                        const { icon: Icon, color, badgeVariant } = getStatusInfo(claim.status);
                        return (
                            <div key={index} className="border p-4 rounded-lg space-y-2">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium italic">"{claim.statement}"</p>
                                    <Badge variant={badgeVariant} className="flex-shrink-0 ml-4">
                                        <Icon className={`mr-1 h-3.5 w-3.5 ${color}`} />
                                        {claim.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{claim.explanation}</p>
                                <p className="text-xs text-muted-foreground">Source: 
                                    <Link href={`https://${claim.source}`} target="_blank" className="hover:underline text-primary">
                                        {claim.source} <ExternalLink className="inline h-3 w-3" />
                                    </Link>
                                </p>
                            </div>
                        )
                    })}
                </div>
                ) : (
                     <div className="text-center text-muted-foreground py-8">
                        <p>No verifiable claims were found in the provided text.</p>
                    </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number) {
    if (score < 50) return 'text-destructive';
    if (score < 80) return 'text-yellow-500';
    return 'text-green-500';
}
