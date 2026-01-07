
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAcademicLiteratureReview } from '@/hooks/writing-tools/use-academic-literature-review';
import { BookCopy, FileText, Loader2, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';

export function AcademicLiteratureReviewTool() {
    const { form, mutation, onSubmit, results } = useAcademicLiteratureReview();
    const { register, control, formState: { errors } } = form;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Review Configuration</CardTitle>
                    <CardDescription>Set the parameters for your literature review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Research Topic</Label>
                            <Input id="topic" {...register('topic')} placeholder="e.g., AI in higher education" />
                            {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                            <Input id="keywords" {...register('keywords')} placeholder="e.g., machine learning, adaptive learning" />
                            {errors.keywords && <p className="text-sm text-destructive">{errors.keywords.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="focusAreas">Focus Areas (comma-separated)</Label>
                            <Input id="focusAreas" {...register('focusAreas')} placeholder="e.g., student engagement, assessment" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="citationStyle">Citation Style</Label>
                                <Select onValueChange={(v) => form.setValue('citationStyle', v as any)} defaultValue={form.getValues('citationStyle')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="APA">APA</SelectItem>
                                        <SelectItem value="MLA">MLA</SelectItem>
                                        <SelectItem value="Chicago">Chicago</SelectItem>
                                        <SelectItem value="Harvard">Harvard</SelectItem>
                                        <SelectItem value="IEEE">IEEE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="minLength">Min Length (words)</Label>
                                <Input id="minLength" type="number" {...register('minLength', { valueAsNumber: true })} />
                            </div>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="includeGaps" {...register('includeGaps')} defaultChecked />
                            <Label htmlFor="includeGaps">Identify Research Gaps</Label>
                        </div>
                        <Button type="submit" disabled={mutation.isPending} className="w-full">
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Review (10 Credits)
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Generated Literature Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {mutation.isPending ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Generating literature review... this may take a moment.</p>
                            </div>
                        ) : results ? (
                            <div className="space-y-4">
                                <ScrollArea className="h-[60vh] border rounded-md p-4 bg-muted/20">
                                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: results.literatureReview.replace(/\n/g, '<br />') }} />
                                </ScrollArea>
                                <Accordion type="multiple" className="w-full">
                                    <AccordionItem value="quality">
                                        <AccordionTrigger>Quality Metrics</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            <Badge>Argument Strength: {results.qualityMetrics.argumentStrength}</Badge>
                                            <Badge>Logical Flow: {(results.qualityMetrics.logicalFlowScore * 100).toFixed(0)}%</Badge>
                                            <p className="font-semibold text-sm mt-2">Recommendations:</p>
                                            <ul className="list-disc pl-5 text-sm">{results.qualityMetrics.recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="citations">
                                        <AccordionTrigger>Citation Analysis</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            <Badge>Total Citations: {results.citations.totalCitations}</Badge>
                                            <Badge variant="secondary">Valid: {results.citations.validCitations}</Badge>
                                             {results.citations.citationIssues.length > 0 && <div><p className="font-semibold text-sm mt-2">Issues Found:</p><ul className="list-disc pl-5 text-sm text-destructive">{results.citations.citationIssues.map((issue,i)=><li key={i}>{issue}</li>)}</ul></div>}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground">
                                <BookCopy className="h-16 w-16 mb-4 opacity-30"/>
                                <h3 className="font-semibold text-lg">Your literature review will appear here.</h3>
                                <p className="text-sm">Configure the options on the left and click "Generate Review".</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
