
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useReadabilityChecker } from '@/hooks/writing-tools/use-readability-checker';
import { Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ReadabilityChecker() {
    const { form, mutation, onSubmit, results } = useReadabilityChecker();

    const getScoreColor = (score: number) => {
        if (score < 30) return 'bg-red-500';
        if (score < 60) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Readability Checker</CardTitle>
                <CardDescription>Analyze your text's readability score and grade level.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste the text you want to check here..."
                        rows={10}
                        className="resize-none"
                    />
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analyze Readability
                    </Button>
                </form>

                {mutation.isPending && (
                    <div className="mt-6 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </div>
                )}
                {results && (
                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">Analysis Results</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Flesch Reading Ease</span>
                                <span className="font-bold">{results.fleschReadingEase.toFixed(1)}</span>
                            </div>
                            <Progress value={results.fleschReadingEase} className="h-2 [&>div]:bg-green-500" />
                             <p className="text-xs text-muted-foreground">Higher is better. 60-70 is easily understood by most adults.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <Card><CardHeader><CardTitle>{results.fleschKincaidGrade.toFixed(1)}</CardTitle><CardDescription>Grade Level</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle>{results.avgSentenceLength.toFixed(1)}</CardTitle><CardDescription>Avg. Sentence</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle>{results.avgWordLength.toFixed(1)}</CardTitle><CardDescription>Avg. Word</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle>{results.complexWords}</CardTitle><CardDescription>Complex Words</CardDescription></CardHeader></Card>
                        </div>
                         <div className="space-y-2">
                             <h4 className="font-semibold">Suggestions</h4>
                             <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                {results.suggestions.map((s,i) => <li key={i}>{s}</li>)}
                             </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
