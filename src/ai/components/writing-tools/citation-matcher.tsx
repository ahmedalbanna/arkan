
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCitationMatcher } from '@/hooks/writing-tools/use-citation-matcher';
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CitationMatcher() {
    const { form, mutation, onSubmit, results } = useCitationMatcher();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Citation & Reference Matcher</CardTitle>
                <CardDescription>Cross-reference in-text citations with your bibliography to find mismatches.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('documentText')}
                        placeholder="Paste the full document text here..."
                        rows={8}
                        className="resize-none"
                    />
                    <Textarea
                        {...form.register('references')}
                        placeholder="Paste the reference list here..."
                        rows={8}
                        className="resize-none"
                    />
                    <Select onValueChange={(value) => form.setValue('citationStyle', value as any)} defaultValue={form.getValues('citationStyle')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="APA">APA</SelectItem>
                            <SelectItem value="MLA">MLA</SelectItem>
                            <SelectItem value="Chicago">Chicago</SelectItem>
                            <SelectItem value="Harvard">Harvard</SelectItem>
                            <SelectItem value="IEEE">IEEE</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.documentText && <p className="text-sm text-destructive">{form.formState.errors.documentText.message}</p>}
                    {form.formState.errors.references && <p className="text-sm text-destructive">{form.formState.errors.references.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Match Citations
                    </Button>
                </form>

                {mutation.isPending && (
                    <div className="mt-6 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Matching...
                    </div>
                )}
                {results && (
                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">Matching Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Cited but not in References</CardTitle></CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-40 border rounded-md p-2">
                                        {results.citedButNotInReferences.length > 0 ? <ul className="list-disc pl-5 text-sm">{results.citedButNotInReferences.map((c, i) => <li key={i}>{c}</li>)}</ul> : <p className="text-center text-muted-foreground text-sm">None found.</p>}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> In References but not Cited</CardTitle></CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-40 border rounded-md p-2">
                                        {results.inReferencesButNotCited.length > 0 ? <ul className="list-disc pl-5 text-sm">{results.inReferencesButNotCited.map((c, i) => <li key={i}>{c}</li>)}</ul> : <p className="text-center text-muted-foreground text-sm">None found.</p>}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500"/> Summary</CardTitle></CardHeader>
                            <CardContent className="text-sm">
                                <p>Matched Citations: {results.matchedCitations}</p>
                                <p>Unmatched Citations: {results.unmatchedCitations}</p>
                                <p>Unmatched References: {results.unmatchedReferences}</p>
                                {results.recommendations.length > 0 && <div className="mt-2"><strong>Recommendations:</strong> <ul className="list-disc pl-5">{results.recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul></div>}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
