
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDetectAiContent } from '@/hooks/use-writing-tools';
import { toast } from '@/hooks/use-toast';

const aiDetectorSchema = z.object({
  text: z.string().min(100, 'Please enter at least 100 characters for an accurate analysis.'),
});

type AIDetectorFormValues = z.infer<typeof aiDetectorSchema>;

interface AIAnalysisResult {
    score: number;
    analysis: string;
}

export function AIDetectorTool() {
  const mutation = useDetectAiContent();

  const form = useForm<AIDetectorFormValues>({
    resolver: zodResolver(aiDetectorSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = async (data: AIDetectorFormValues) => {
    mutation.mutate({ text: data.text }, {
        onError: (error) => {
            toast({ title: "Analysis Failed", description: error.message, variant: 'destructive' });
        }
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-destructive';
    if (score > 40) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const result = mutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Content Analyzer</CardTitle>
        <CardDescription>Paste your text into the box below. Our AI will analyze it and provide a probability score of it being AI-generated.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-analyze">Text Content</Label>
            <Textarea
              id="text-to-analyze"
              {...form.register('text')}
              rows={12}
              placeholder="Enter text to analyze for AI generation..."
              className="resize-none"
            />
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Analyze Text
          </Button>
        </form>

        {mutation.isPending && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing linguistic patterns...
                </div>
                <Progress value={50} className="w-full" />
            </div>
        )}

        {result && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">Analysis Report</h3>
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">AI-Generated Content Probability</p>
                    <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{result.analysis}</p>
                </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
