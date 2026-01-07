
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useArgumentStructureAnalyzer } from '@/hooks/writing-tools/use-argument-structure-analyzer';
import { Loader2, Sparkles, Lightbulb, CheckSquare, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ArgumentStructureAnalyzer() {
    const { form, mutation, onSubmit, results } = useArgumentStructureAnalyzer();

    const getStrengthColor = (strength: 'strong' | 'moderate' | 'weak') => {
        if (strength === 'strong') return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        if (strength === 'moderate') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Argument Structure Analyzer</CardTitle>
                <CardDescription>Evaluate the strength and coherence of your arguments, thesis, and evidence.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste your argumentative text here..."
                        rows={10}
                        className="resize-none"
                    />
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analyze Argument
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="flex flex-col">
                                <CardHeader><CardTitle>Overall Strength</CardTitle></CardHeader>
                                <CardContent className="flex-grow flex items-center justify-center">
                                    <Badge className={`text-xl px-4 py-2 capitalize ${getStrengthColor(results.overallStrength)}`}>
                                        {results.overallStrength}
                                    </Badge>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare size={20}/> Thesis</CardTitle></CardHeader>
                                <CardContent>
                                    {results.hasThesis ? (
                                        <p className="italic text-muted-foreground">"{results.thesis}"</p>
                                    ) : (
                                        <p className="text-destructive-foreground">No clear thesis statement found.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-2">
                             <h4 className="font-semibold flex items-center gap-2"><MessageSquare size={16}/> Main Arguments</h4>
                             <ScrollArea className="h-60 border rounded-md p-4">
                                {results.arguments.length === 0 ? <p className="text-center text-muted-foreground">No main arguments identified.</p> :
                                    <div className="space-y-4">
                                        {results.arguments.map((arg, index) => (
                                            <div key={index} className="text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className={getStrengthColor(arg.strength)}>Strength: {arg.strength}</Badge>
                                                    <p className="font-medium">{arg.claim}</p>
                                                </div>
                                                <ul className="list-disc pl-8 mt-1 text-xs text-muted-foreground">
                                                    {arg.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                }
                             </ScrollArea>
                        </div>

                         <Alert>
                            <Lightbulb className="h-4 w-4"/>
                            <AlertDescription>
                                <h5 className="font-semibold mb-2">Suggestions for Improvement</h5>
                                <ul className="list-disc pl-5 space-y-1">
                                    {results.suggestions.map((s,i) => <li key={i}>{s}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
