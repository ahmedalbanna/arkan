
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useWordChoiceImprover } from '@/hooks/writing-tools/use-word-choice-improver';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export function WordChoiceImprover() {
    const { form, mutation, onSubmit, results } = useWordChoiceImprover();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Word Choice Improver</CardTitle>
                <CardDescription>Get suggestions for better word choices to enhance your writing style.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Textarea
                        {...form.register('text')}
                        placeholder="Paste the text you want to improve here..."
                        rows={10}
                        className="resize-none"
                    />
                     <Select onValueChange={(value) => form.setValue('style', value as any)} defaultValue={form.getValues('style')}>
                        <SelectTrigger><SelectValue placeholder="Select a style" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="vivid">Vivid</SelectItem>
                            <SelectItem value="simple">Simple</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Improve Word Choice
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
                        <h3 className="font-semibold">Improvement Suggestions ({results.totalSuggestions})</h3>
                         <ScrollArea className="h-60 border rounded-md p-4">
                            {results.improvements.length === 0 ? (
                                <p className="text-center text-muted-foreground">No specific improvements suggested. The text is well-written!</p>
                            ) : (
                                <div className="space-y-4">
                                    {results.improvements.map((item, index) => (
                                        <div key={index} className="text-sm">
                                            <p className="text-muted-foreground">{item.reason}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="line-through text-destructive/80">{item.original}</span>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-green-600 dark:text-green-400 font-semibold">{item.suggestion}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
