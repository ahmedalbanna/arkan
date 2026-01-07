
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGrammarChecker } from '@/hooks/writing-tools/use-grammar-checker';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function GrammarChecker() {
    const { form, mutation, onSubmit, results } = useGrammarChecker();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grammar & Spelling Checker</CardTitle>
                <CardDescription>Analyze text for grammar, spelling, and punctuation errors.</CardDescription>
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
                        Check Grammar
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <Card><CardHeader><CardTitle>{results.totalIssues}</CardTitle><CardDescription>Total Issues</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="text-destructive">{results.errorCount}</CardTitle><CardDescription>Errors</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="text-yellow-500">{results.warningCount}</CardTitle><CardDescription>Warnings</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle>{results.infoCount}</CardTitle><CardDescription>Info</CardDescription></CardHeader></Card>
                        </div>
                        <ScrollArea className="h-60 border rounded-md p-4">
                            {results.issues.length === 0 ? (
                                <p className="text-center text-muted-foreground">No issues found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {results.issues.map((issue, index) => (
                                        <div key={index} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'}>{issue.type}</Badge>
                                                <p className="font-medium">{issue.message}</p>
                                            </div>
                                            <p className="text-muted-foreground italic pl-2 border-l-2 ml-2 mt-1">"{issue.context}"</p>
                                            <p className="text-green-600 pl-2 border-l-2 ml-2 mt-1">Suggestion: {issue.suggestions.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
