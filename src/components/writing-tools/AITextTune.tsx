
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, Check, Wand2, BookOpenText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useRewriteText, useSummarizeTextWithRatio } from '@/hooks/use-writing-tools';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters.'),
  style: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const styles = [
  "Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative",
  "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative",
  "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"
];

export function AITextTune() {
  const [processedText, setProcessedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);

  const rewriteMutation = useRewriteText();
  const summarizeMutation = useSummarizeTextWithRatio();
  const isProcessing = rewriteMutation.isPending || summarizeMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', style: 'None' },
  });

  const onSubmitRewrite = (data: FormValues) => {
    if (!data.style || data.style === 'None') {
      toast({ title: 'Style required', description: 'Please select a style to rewrite the text.', variant: 'destructive' });
      return;
    }
    rewriteMutation.mutate({ text: data.text, style: data.style }, {
      onSuccess: (result) => setProcessedText(result.rewrittenText),
    });
  };

  const onSubmitSummarize = (data: FormValues) => {
    summarizeMutation.mutate({ text: data.text, ratio: compressionRatio }, {
        onSuccess: (result) => setProcessedText(result.summarizedText)
    });
  };

  const handleCopy = () => {
    if (!processedText) return;
    navigator.clipboard.writeText(processedText).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
            <Card>
                <CardHeader>
                    <CardTitle>Controls</CardTitle>
                    <CardDescription>Select a tool and adjust its settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmitRewrite)} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4"/> Rewrite Text</h3>
                        <div className="space-y-2">
                            <Label htmlFor="style-select">Style</Label>
                            <Controller
                            name="style"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                                <SelectTrigger id="style-select">
                                    <SelectValue placeholder="Select a style..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            )}
                            />
                        </div>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                            {rewriteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            Rewrite
                        </Button>
                    </form>

                     <div className="border-t pt-6 mt-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><BookOpenText className="h-4 w-4"/> Summarize Text</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Compression Ratio</Label>
                                <Badge variant="outline">{compressionRatio}%</Badge>
                            </div>
                            <Slider
                                value={[compressionRatio]}
                                onValueChange={(val) => setCompressionRatio(val[0])}
                                min={10} max={90} step={5}
                                disabled={isProcessing}
                            />
                        </div>
                        <Button onClick={form.handleSubmit(onSubmitSummarize)} disabled={isProcessing} className="w-full">
                            {summarizeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            Summarize
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="input-text">Original Text</Label>
                    <Textarea
                        id="input-text"
                        {...form.register('text')}
                        rows={20}
                        placeholder="Enter your text here..."
                        className="mt-2"
                        disabled={isProcessing}
                    />
                     {form.formState.errors.text && <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>}
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="output-text">Processed Text</Label>
                         <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!processedText}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Card className="mt-2 h-[430px]">
                        <ScrollArea className="h-full">
                             <CardContent className="p-4 prose dark:prose-invert max-w-none">
                                {isProcessing ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <p className="text-sm">{processedText || 'Your processed text will appear here...'}</p>
                                )}
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
