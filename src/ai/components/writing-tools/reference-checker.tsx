
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useReferenceChecker } from '@/hooks/writing-tools/use-reference-checker';
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ReferenceChecker() {
    const { form, mutation, onSubmit, results } = useReferenceChecker();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reference List Checker</CardTitle>
                <CardDescription>Validate your bibliography or reference list for formatting and completeness.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('references')}
                        placeholder="Paste your reference list here..."
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
                    {form.formState.errors.references && <p className="text-sm text-destructive">{form.formState.errors.references.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Check References
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
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <Card><CardHeader><CardTitle>{results.totalReferences}</CardTitle><CardDescription>Total</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="text-green-500">{results.validReferences}</CardTitle><CardDescription>Valid</CardDescription></CardHeader></Card>
                            <Card><CardHeader><CardTitle className="text-destructive">{results.invalidReferences}</CardTitle><CardDescription>Invalid</CardDescription></CardHeader></Card>
                        </div>
                        <ScrollArea className="h-60 border rounded-md p-4">
                            {results.references.length === 0 ? <p className="text-center text-muted-foreground">No references found.</p> :
                                <div className="space-y-4">
                                    {results.references.map((ref, index) => (
                                        <div key={index} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                {ref.isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                                                <p className="italic text-muted-foreground">"{ref.text}"</p>
                                            </div>
                                            {ref.issues.length > 0 && <ul className="list-disc pl-8 mt-1 text-xs text-destructive">{ref.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
                                            {ref.suggestions.length > 0 && <ul className="list-disc pl-8 mt-1 text-xs text-green-600">{ref.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>}
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
