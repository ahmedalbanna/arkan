
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToneAnalyzer } from '@/hooks/writing-tools/use-tone-analyzer';
import { Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

export function ToneAnalyzer() {
    const { form, mutation, onSubmit, results } = useToneAnalyzer();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tone Analyzer</CardTitle>
                <CardDescription>Analyze the emotional tone of your writing and get suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste the text you want to analyze here..."
                        rows={10}
                        className="resize-none"
                    />
                     <Select onValueChange={(value) => form.setValue('targetTone', value as any)} defaultValue={form.getValues('targetTone')}>
                        <SelectTrigger><SelectValue placeholder="Select a target tone (optional)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="persuasive">Persuasive</SelectItem>
                             <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analyze Tone
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Detected Tone: {results.detectedTone}</CardTitle>
                                <CardDescription>Confidence: {Math.round(results.confidence * 100)}%</CardDescription>
                                <Progress value={results.confidence * 100} className="w-full h-2 mt-2"/>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <h4 className="font-medium">Tone Attributes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {results.toneAttributes.map((attr, i) => <Badge key={i} variant="secondary">{attr}</Badge>)}
                                    </div>
                                </div>
                                {results.suggestions && results.suggestions.length > 0 && (
                                     <div className="mt-4 space-y-2">
                                         <h4 className="font-medium">Suggestions for Improvement</h4>
                                         <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            {results.suggestions.map((s,i) => <li key={i}>{s}</li>)}
                                         </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
