'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Languages, Copy, Check } from 'lucide-react';
import { useWritingTool, useToast } from '@/hooks';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { ScrollArea } from '@/components/ui/scroll-area';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'sp', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ge', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ch', label: 'Chinese' },
  { value: 'ru', label: 'Russian' },
];

const translateSchema = z.object({
  text: z.string().min(1, 'Please enter some text to translate.'),
  targetLang: z.string().min(1, 'Please select a target language.'),
});

type TranslateFormValues = z.infer<typeof translateSchema>;

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { Globe, ArrowRightLeft, FileText, Download, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

function TranslatorTool() {
  const { toast } = useToast();
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const mutation = useWritingTool('translate-text', {
    onSuccess: (data: any) => {
      setTranslatedText(data.text);
      toast({ title: 'Translation Successful' });
    },
    onError: (error) => {
      toast({ title: 'Translation Failed', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<TranslateFormValues>({
    resolver: zodResolver(translateSchema),
    defaultValues: {
      text: '',
      targetLang: 'ar',
    },
  });

  const onSubmit = (data: TranslateFormValues) => {
    setOriginalText(data.text);
    mutation.mutate(data);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Background */}
      <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
              background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
          }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Linguistic Engine</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Contextual Translation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
            <Languages className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            AI Translator
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl italic font-serif leading-relaxed opacity-80">
            High-fidelity linguistic synthesis protocols for translating complex documentation while preserving semantic integrity and markdown structure.
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
            <h2 className="text-2xl font-bold font-headline tracking-tight">Translation Manifest</h2>
            <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute autonomous linguistic protocols across multiple technical and academic domains.</p>
          </header>

          <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
            {/* Setup Zone (Left) */}
            <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                    <div className="p-8 space-y-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                            <FileText className="h-3 w-3 text-primary" />
                                            Source Payload
                                        </Label>
                                        <FormField
                                            control={form.control}
                                            name="text"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter source text or markdown..."
                                                            className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[300px]"
                                                            {...field}
                                                            disabled={mutation.isPending}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px] font-bold uppercase mt-2 px-2" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator className="bg-border/40" />

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                            <Globe className="h-3 w-3 text-primary" />
                                            Target Identity
                                        </Label>
                                        <FormField
                                            control={form.control}
                                            name="targetLang"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                                                <SelectValue placeholder="Select target language" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {languages.map(lang => (
                                                                <SelectItem key={lang.value} value={lang.value} className="text-xs">{lang.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                                    Initialize Synthesis
                                </Button>
                            </form>
                        </Form>

                        <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                Translation protocols preserve all structural markdown elements and technical nomenclature.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Results Canvas (Right) */}
            <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
                {/* Subtle Canvas Background */}
                <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                    {(mutation.isPending || translatedText) ? (
                        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                            <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Linguistic Manifest</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!translatedText} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                        {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                                {mutation.isPending ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Linguistic Synthesis</p>
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                        <ReactMarkdown components={markdownComponents}>{translatedText}</ReactMarkdown>
                                    </div>
                                )}
                                {/* Page Footer Visual */}
                                <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                    <span>Arkan Linguistic Engine</span>
                                    <span>VERIFIED SYNTHESIS</span>
                                </div>
                            </ScrollArea>

                            {!mutation.isPending && (
                                <div className="flex justify-end gap-3 px-1 pt-2 opacity-60 hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest gap-2 h-8 px-3">
                                        <Download className="h-3.5 w-3.5" /> SNAPSHOT
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                            <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                                <Globe className="h-10 w-10 text-primary/60" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Linguistic Canvas Ready</h3>
                                <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Define the source payload and target language on the left to begin synthesis.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TranslatorTool;
