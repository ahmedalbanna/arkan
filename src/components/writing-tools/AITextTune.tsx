
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
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import type { RewriteTextOutput } from '@/ai/flows/text-stylist';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';


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

const DiffView = ({ diff }: { diff: RewriteTextOutput['diff'] }) => {
    return (
        <p>
            {diff.map((part, index) => (
                <span key={index} className={cn({
                    'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300': part.type === 'added',
                    'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through': part.type === 'removed',
                })}>
                    {part.value}
                </span>
            ))}
        </p>
    )
}

export function AITextTune() {
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [diff, setDiff] = useState<RewriteTextOutput['diff'] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(50);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');

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
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side'); // Reset to default view on new generation
    rewriteMutation.mutate({ text: data.text, style: data.style }, {
      onSuccess: (result) => {
          setProcessedText(result.rewrittenText);
          setDiff(result.diff);
      },
    });
  };

  const onSubmitSummarize = (data: FormValues) => {
    setOriginalText(data.text);
    setProcessedText('');
    setDiff(null);
    setActiveView('side-by-side');
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
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="input-text" className="text-lg font-semibold">Your Text</Label>
                <Textarea
                    id="input-text"
                    {...form.register('text')}
                    rows={8}
                    placeholder="Enter your text here..."
                    className="mt-2"
                    disabled={isProcessing}
                />
                {form.formState.errors.text && <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>AI Tools</CardTitle>
            <CardDescription>Use the tools below to refine your text.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={form.handleSubmit(onSubmitRewrite)} className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Wand2 className="h-5 w-5"/> Rewrite Text</h3>
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

            <form onSubmit={form.handleSubmit(onSubmitSummarize)} className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><BookOpenText className="h-5 w-5"/> Summarize Text</h3>
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
                <Button type="submit" disabled={isProcessing} className="w-full">
                    {summarizeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                    Summarize
                </Button>
            </form>
        </CardContent>
      </Card>

      {(isProcessing || processedText || originalText) && (
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Comparison</CardTitle>
                        <CardDescription>View your original text and the AI-processed version.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        {diff && (
                             <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
                                <TabsList>
                                    <TabsTrigger value="side-by-side">Side-by-side</TabsTrigger>
                                    <TabsTrigger value="diff">Diff</TabsTrigger>
                                </TabsList>
                             </Tabs>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!processedText}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {activeView === 'side-by-side' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="input-text">Original Text</Label>
                            <ScrollArea className="h-72 rounded-md border p-4 bg-background">
                                <div className="prose dark:prose-invert max-w-none text-sm">
                                    <ReactMarkdown components={markdownComponents}>{originalText || "Your original text will appear here once you process it."}</ReactMarkdown>
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="output-text">Processed Text</Label>
                            <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
                                {isProcessing ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none text-sm">
                                        <ReactMarkdown components={markdownComponents}>{processedText || "Your processed text will appear here..."}</ReactMarkdown>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                 ) : (
                    <div className="space-y-2">
                        <Label>Changes</Label>
                        <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
                           {isProcessing ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                                    {diff && <DiffView diff={diff} />}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                 )}
            </CardContent>
          </Card>
      )}
    </div>
  );
}
