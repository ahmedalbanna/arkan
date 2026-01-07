
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCitationValidator } from '@/hooks/writing-tools/use-citation-validator';
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CitationValidator() {
    const { form, mutation, onSubmit, results } = useCitationValidator();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Citation Validator</CardTitle>
                <CardDescription>Validate in-text citations for various academic styles (APA, MLA, etc.).</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste text with citations here..."
                        rows={10}
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
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Validate Citations
                    </Button>
                </form>

                {mutation.isPending && (
                    <div className="mt-6 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                    </div>
                )}
                {results && (
                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">Validation Results</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <Card><CardHeader><CardTitle>{results.totalCitations}</CardTitle><CardDescription>Total</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="text-green-500">{results.validCitations}</CardTitle><CardDescription>Valid</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="text-destructive">{results.invalidCitations}</CardTitle><CardDescription>Invalid</CardDescription></CardHeader></Card>
                        </div>
                        <ScrollArea className="h-60 border rounded-md p-4">
                            {results.citations.length === 0 ? <p className="text-center text-muted-foreground">No citations found.</p> :
                                <div className="space-y-4">
                                    {results.citations.map((citation, index) => (
                                        <div key={index} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                {citation.isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                                                <Badge variant="secondary">{citation.text}</Badge>
                                            </div>
                                            {citation.issues.length > 0 && <ul className="list-disc pl-8 mt-1 text-xs text-destructive">{citation.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
                                        </div>
                                    ))}
                                </div>
                            }
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
