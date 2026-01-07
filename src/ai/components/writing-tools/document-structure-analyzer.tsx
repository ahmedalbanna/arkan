
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentStructureAnalyzer } from '@/hooks/writing-tools/use-document-structure-analyzer';
import { Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

export function DocumentStructureAnalyzer() {
    const { form, mutation, onSubmit, results } = useDocumentStructureAnalyzer();

    const getScoreColor = (score: number) => {
        if (score < 0.3) return 'bg-red-500';
        if (score < 0.6) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Structure Analyzer</CardTitle>
                <CardDescription>Analyze the structure, coherence, and flow of your document.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste the document text here..."
                        rows={10}
                        className="resize-none"
                    />
                    <Select onValueChange={(value) => form.setValue('documentType', value as any)} defaultValue={form.getValues('documentType')}>
                        <SelectTrigger><SelectValue placeholder="Select a document type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analyze Structure
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
                                <span className="font-medium">Coherence Score</span>
                                <span className="font-bold">{Math.round(results.coherence.score * 100)}%</span>
                            </div>
                            <Progress value={results.coherence.score * 100} className="h-2" indicatorClassName={getScoreColor(results.coherence.score)} />
                             <p className="text-xs text-muted-foreground">Measures how well the document flows logically.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <Card><CardHeader><CardTitle>{results.structure.headings.length}</CardTitle><CardDescription>Headings</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle>{results.structure.sections}</CardTitle><CardDescription>Sections</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle>{results.structure.paragraphs}</CardTitle><CardDescription>Paragraphs</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="capitalize">{results.transitions.quality}</CardTitle><CardDescription>Transitions</CardDescription></CardHeader></Card>
                        </div>
                        
                         <Alert>
                            <Lightbulb className="h-4 w-4"/>
                            <AlertDescription>
                                <h5 className="font-semibold mb-2">Recommendations</h5>
                                <ul className="list-disc pl-5 space-y-1">
                                    {results.recommendations.map((s,i) => <li key={i}>{s}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

