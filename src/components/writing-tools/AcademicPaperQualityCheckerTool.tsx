
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAcademicPaperQualityChecker } from '@/hooks/writing-tools/use-academic-paper-quality-checker';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export function AcademicPaperQualityCheckerTool() {
    const { form, mutation, onSubmit, results } = useAcademicPaperQualityChecker();
    const { register, control, formState: { errors } } = form;

    const getScoreColor = (score: number) => {
        if (score < 50) return 'bg-red-500';
        if (score < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Paper & Analysis Options</CardTitle>
                    <CardDescription>Provide your paper and select which checks to run.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="documentText">Document Text</Label>
                            <Textarea id="documentText" {...register('documentText')} rows={10} placeholder="Paste your full academic paper here..." />
                            {errors.documentText && <p className="text-sm text-destructive">{errors.documentText.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="references">References</Label>
                            <Textarea id="references" {...register('references')} rows={5} placeholder="Paste your reference list here..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="citationStyle">Citation Style</Label>
                                <Select onValueChange={(v) => form.setValue('citationStyle', v as any)} defaultValue={form.getValues('citationStyle')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="APA">APA</SelectItem><SelectItem value="MLA">MLA</SelectItem></SelectContent></Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="documentType">Document Type</Label>
                                <Select onValueChange={(v) => form.setValue('documentType', v as any)} defaultValue={form.getValues('documentType')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="research_paper">Research Paper</SelectItem><SelectItem value="thesis">Thesis</SelectItem></SelectContent></Select>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Checks to perform:</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2"><Checkbox id="checkGrammar" {...register('checkGrammar')} defaultChecked/><Label htmlFor="checkGrammar">Grammar</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="checkCitations" {...register('checkCitations')} defaultChecked/><Label htmlFor="checkCitations">Citations</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="checkStructure" {...register('checkStructure')} defaultChecked/><Label htmlFor="checkStructure">Structure</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="checkReadability" {...register('checkReadability')} defaultChecked/><Label htmlFor="checkReadability">Readability</Label></div>
                            </div>
                        </div>
                        <Button type="submit" disabled={mutation.isPending} className="w-full">
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Check Quality (8 Credits)
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck /> Quality Report</CardTitle>
                    </CardHeader>
                     <CardContent>
                        {mutation.isPending ? <div className="flex flex-col items-center justify-center min-h-[400px]"><Loader2 className="h-12 w-12 animate-spin text-primary"/><p className="mt-4 text-muted-foreground">Performing comprehensive analysis...</p></div>
                        : results ? (
                            <div className="space-y-4">
                                <Card><CardHeader className="text-center"><CardTitle className="text-5xl">{results.overallScore}<span className="text-lg">/100</span></CardTitle><CardDescription>{results.qualityLevel.replace('_', ' ')}</CardDescription></CardHeader></Card>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.entries(results.scores).map(([key, value]) => value && <div key={key}><Label className="text-sm capitalize">{key}</Label><Progress value={value} indicatorClassName={getScoreColor(value)}/></div>)}
                                </div>
                                <Accordion type="multiple" className="w-full">
                                    <AccordionItem value="summary"><AccordionTrigger>Summary</AccordionTrigger><AccordionContent><p className="font-semibold">Strengths:</p><ul className="list-disc pl-5">{results.summary.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul><p className="font-semibold mt-2">Weaknesses:</p><ul className="list-disc pl-5">{results.summary.weaknesses.map((w,i)=><li key={i}>{w}</li>)}</ul></AccordionContent></AccordionItem>
                                    <AccordionItem value="recommendations"><AccordionTrigger>Recommendations</AccordionTrigger><AccordionContent><p className="font-semibold text-destructive">Critical:</p><ul className="list-disc pl-5 text-destructive">{results.recommendations.critical.map((r,i)=><li key={i}>{r}</li>)}</ul><p className="font-semibold mt-2">Important:</p><ul className="list-disc pl-5">{results.recommendations.important.map((r,i)=><li key={i}>{r}</li>)}</ul></AccordionContent></AccordionItem>
                                </Accordion>
                            </div>
                        ) : <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground"><ShieldCheck className="h-16 w-16 opacity-30"/><p className="mt-4">Your quality report will appear here.</p></div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
