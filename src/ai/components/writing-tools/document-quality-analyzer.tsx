
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentQualityAnalyzer } from '@/hooks/writing-tools/use-document-quality-analyzer';
import { AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react';

export function DocumentQualityAnalyzer() {
    const { form, mutation, onSubmit, results } = useDocumentQualityAnalyzer();

    const getScoreColor = (score: number) => {
        if (score < 50) return 'bg-red-500';
        if (score < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comprehensive Document Quality Analyzer</CardTitle>
                <CardDescription>Get a holistic quality score for your document, combining grammar, structure, readability, and citation checks.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste the full document text here..."
                        rows={10}
                        className="resize-none"
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <Select onValueChange={(value) => form.setValue('documentType', value as any)} defaultValue={form.getValues('documentType')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="academic">Academic</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select onValueChange={(value) => form.setValue('citationStyle', value as any)} defaultValue={form.getValues('citationStyle')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                               <SelectItem value="APA">APA</SelectItem>
                                <SelectItem value="MLA">MLA</SelectItem>
                               <SelectItem value="Chicago">Chicago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2"><Checkbox {...form.register('checkGrammar')} defaultChecked /> <label>Grammar</label></div>
                        <div className="flex items-center space-x-2"><Checkbox {...form.register('checkStructure')} defaultChecked /> <label>Structure</label></div>
                        <div className="flex items-center space-x-2"><Checkbox {...form.register('checkCitations')} /> <label>Citations</label></div>
                    </div>
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analyze Document Quality
                    </Button>
                </form>

                {mutation.isPending && (
                    <div className="mt-6 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Performing comprehensive analysis...
                    </div>
                )}
                {results && (
                    <div className="mt-6 space-y-6">
                        <h3 className="font-semibold">Quality Report</h3>
                         <Card>
                            <CardHeader><CardTitle>Overall Quality Score</CardTitle></CardHeader>
                            <CardContent className="text-center">
                                <div className={`text-7xl font-bold ${getScoreColor(results.overallScore)}`}>{results.overallScore}</div>
                                <p className="text-sm text-muted-foreground">out of 100</p>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {results.grammarScore && <div><Label>Grammar</Label><Progress value={results.grammarScore} indicatorClassName={getScoreColor(results.grammarScore)}/></div>}
                            {results.structureScore && <div><Label>Structure</Label><Progress value={results.structureScore} indicatorClassName={getScoreColor(results.structureScore)}/></div>}
                            {results.citationScore && <div><Label>Citations</Label><Progress value={results.citationScore} indicatorClassName={getScoreColor(results.citationScore)}/></div>}
                            {results.readabilityScore && <div><Label>Readability</Label><Progress value={results.readabilityScore} indicatorClassName={getScoreColor(results.readabilityScore)}/></div>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Strengths</CardTitle></CardHeader>
                                <CardContent><ul className="list-disc pl-5 text-sm">{results.summary.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Weaknesses</CardTitle></CardHeader>
                                <CardContent><ul className="list-disc pl-5 text-sm">{results.summary.weaknesses.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
                            </Card>
                        </div>
                         <Card>
                            <CardHeader><CardTitle>Priority Improvements</CardTitle></CardHeader>
                            <CardContent><ul className="list-disc pl-5 text-sm">{results.summary.priority_improvements.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
