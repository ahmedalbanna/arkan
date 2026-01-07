
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLogicalFlowChecker } from '@/hooks/writing-tools/use-logical-flow-checker';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function LogicalFlowChecker() {
    const { form, mutation, onSubmit, results } = useLogicalFlowChecker();

    const getScoreColor = (score: number) => {
        if (score < 0.5) return 'bg-red-500';
        if (score < 0.8) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logical Flow Checker</CardTitle>
                <CardDescription>Analyze your text for logical consistency and flow between ideas.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste your text here to check its logical flow..."
                        rows={10}
                        className="resize-none"
                    />
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Check Flow
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
                                <span className="font-medium">Logical Flow Score</span>
                                <span className="font-bold">{Math.round(results.flowScore * 100)}%</span>
                            </div>
                            <Progress value={results.flowScore * 100} className="h-2" indicatorClassName={getScoreColor(results.flowScore)} />
                        </div>
                        
                        <div className="space-y-2">
                             <h4 className="font-semibold">Identified Issues & Suggestions</h4>
                             <ScrollArea className="h-60 border rounded-md p-4">
                                {results.issues.length === 0 ? <p className="text-center text-muted-foreground">No logical flow issues found.</p> :
                                    <div className="space-y-4">
                                        {results.issues.map((issue, index) => (
                                            <div key={index} className="text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="destructive" className="capitalize flex-shrink-0"><AlertTriangle size={12} className="mr-1"/>{issue.type.replace('_', ' ')}</Badge>
                                                    <p className="font-medium">{issue.location}</p>
                                                </div>
                                                <p className="text-muted-foreground mt-1 pl-2 border-l-2 ml-2">Suggestion: {issue.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                }
                             </ScrollArea>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
