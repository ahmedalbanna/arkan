
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfessionalDocumentWriter } from '@/hooks/writing-tools/use-professional-document-writer';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';

export function ProfessionalDocumentWriterTool() {
    const { form, mutation, onSubmit, results } = useProfessionalDocumentWriter();
    const { register, control, formState: { errors } } = form;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Document Configuration</CardTitle>
                    <CardDescription>Define the document you want to create.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="documentType">Document Type</Label>
                            <Select onValueChange={(v) => form.setValue('documentType', v as any)} defaultValue={form.getValues('documentType')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="business_report">Business Report</SelectItem><SelectItem value="proposal">Proposal</SelectItem><SelectItem value="white_paper">White Paper</SelectItem><SelectItem value="case_study">Case Study</SelectItem><SelectItem value="executive_summary">Executive Summary</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2"><Label htmlFor="topic">Topic</Label><Input id="topic" {...register('topic')} placeholder="e.g., Q4 Performance Review" />{errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="purpose">Purpose</Label><Input id="purpose" {...register('purpose')} placeholder="e.g., To inform stakeholders of Q4 results" /></div>
                        <div className="space-y-2"><Label htmlFor="targetAudience">Target Audience</Label><Input id="targetAudience" {...register('targetAudience')} placeholder="e.g., Executive Management" /></div>
                        <div className="space-y-2"><Label htmlFor="keyPoints">Key Points (one per line)</Label><Textarea id="keyPoints" {...register('keyPoints')} rows={4} placeholder="Project delivered on time..." /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="tone">Tone</Label><Select onValueChange={(v) => form.setValue('tone', v as any)} defaultValue={form.getValues('tone')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="persuasive">Persuasive</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="length">Length</Label><Select onValueChange={(v) => form.setValue('length', v as any)} defaultValue={form.getValues('length')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="short">Short</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="long">Long</SelectItem></SelectContent></Select></div>
                        </div>
                         <div className="flex items-center space-x-2"><Checkbox id="includeExecutiveSummary" {...register('includeExecutiveSummary')} defaultChecked/><Label htmlFor="includeExecutiveSummary">Include Executive Summary</Label></div>
                         <div className="flex items-center space-x-2"><Checkbox id="includeRecommendations" {...register('includeRecommendations')} defaultChecked/><Label htmlFor="includeRecommendations">Include Recommendations</Label></div>
                        <Button type="submit" disabled={mutation.isPending} className="w-full">
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Write Document (6 Credits)
                        </Button>
                    </form>
                </CardContent>
            </Card>

             <div className="lg:col-span-2">
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> Generated Document</CardTitle></CardHeader>
                    <CardContent>
                        {mutation.isPending ? <div className="flex flex-col items-center justify-center min-h-[400px] text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-muted-foreground">Writing your document...</p></div>
                        : results ? (
                            <div className="space-y-4">
                                <ScrollArea className="h-[60vh] border rounded-md p-4 bg-muted/20">
                                    <div className="prose dark:prose-invert max-w-none"><ReactMarkdown components={markdownComponents}>{results.document}</ReactMarkdown></div>
                                </ScrollArea>
                                <Accordion type="multiple" className="w-full">
                                    <AccordionItem value="quality"><AccordionTrigger>Quality Metrics & Improvements</AccordionTrigger><AccordionContent className="space-y-2"><Badge>Structure Score: {results.qualityMetrics.structureScore}/100</Badge><Badge>Flow Score: {results.qualityMetrics.flowScore}/100</Badge><Badge>Tone Alignment: {(results.qualityMetrics.toneAlignment * 100).toFixed(0)}%</Badge><p className="font-semibold text-sm mt-2">Improvements:</p><ul className="list-disc pl-5 text-sm">{results.improvements.applied.map((r, i) => <li key={i}>{r}</li>).concat(results.improvements.suggestions.map((s,i)=><li key={`s-${i}`}>{s}</li>))}</ul></AccordionContent></AccordionItem>
                                </Accordion>
                            </div>
                        ) : <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground"><FileText className="h-16 w-16 opacity-30"/><p className="mt-4">Your generated document will appear here.</p></div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
