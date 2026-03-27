
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useQuizGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-quiz-generator-logic';
import { Check, FileText, Loader2, Sparkles, X } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FileEdit, ListChecks, HelpCircle, Eye, EyeOff, CheckCircle2, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

export function QuizGeneratorTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    onSubmit,
    generatedQuiz,
    showAnswers,
    setShowAnswers,
  } = useQuizGeneratorLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.aiQuizGenerator.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.aiQuizGenerator.cardDescription')}</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <HelpCircle className="h-3 w-3 text-primary" />
                                    Evaluation Strategy
                                </Label>
                                <Controller
                                    name="questionType"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                                            <SelectTrigger className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple-choice" className="text-xs">Multiple Choice</SelectItem>
                                                <SelectItem value="true-false" className="text-xs">True / False</SelectItem>
                                                <SelectItem value="direct-question" className="text-xs">Direct Question</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <FileText className="h-3 w-3 text-primary" />
                                    Knowledge Source
                                </Label>
                                <Textarea
                                    id="text-to-quiz"
                                    {...form.register('text')}
                                    rows={10}
                                    placeholder={t('writingTools.aiQuizGenerator.placeholder')}
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                />
                                {form.formState.errors.text && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.text.message}</p>}
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <ListChecks className="h-3 w-3 text-primary" />
                                        Evaluation Scale
                                    </Label>
                                    <Badge variant="secondary" className="h-4.5 text-[10px] px-1.5">{form.watch('numQuestions')}</Badge>
                                </div>
                                <Controller
                                    name="numQuestions"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            min={1}
                                            max={20}
                                            step={1}
                                            disabled={mutation.isPending}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            Initialize Assessment
                        </Button>
                    </form>
                </div>
            </ScrollArea>
        </div>

        {/* Results Canvas (Right) */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                {(mutation.isPending || generatedQuiz.length > 0) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Evaluation Manifest</h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShowAnswers(!showAnswers)}
                                    className={cn("h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-primary/10 hover:text-primary transition-all", showAnswers && "bg-primary/10 text-primary")}
                                >
                                    {showAnswers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    {showAnswers ? "Mask Logic" : "Reveal Logic"}
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                            {mutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Compiling Assessment Nodes</p>
                                </div>
                            ) : (
                                <div className="space-y-10 selection:bg-primary/10">
                                    {generatedQuiz.map((q, index) => (
                                        <div key={index} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex items-start gap-4">
                                                <span className="text-[10px] font-bold bg-muted/50 text-muted-foreground w-6 h-6 rounded flex items-center justify-center shrink-0 border">{index + 1}</span>
                                                <p className="text-[15px] font-bold tracking-tight text-foreground leading-snug">{q.question}</p>
                                            </div>
                                            
                                            {(q.type === 'multiple-choice' || q.type === 'true-false') && Array.isArray(q.options) && (
                                                <div className="pl-10 grid gap-2">
                                                    {q.options.map((option: string, i: number) => {
                                                        const isCorrect = q.answer === option;
                                                        return (
                                                            <div key={i} className={cn(
                                                                "flex items-center justify-between p-3 rounded-xl border text-[13px] transition-all",
                                                                showAnswers && isCorrect ? "border-green-500/50 bg-green-500/[0.03] text-green-700 dark:text-green-400" : "border-border/40 bg-muted/5"
                                                            )}>
                                                                <span className={cn(showAnswers && isCorrect && "font-bold")}>{option}</span>
                                                                {showAnswers && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            
                                            {q.type === 'direct-question' && showAnswers && (
                                                <div className="pl-10 animate-in fade-in zoom-in-95 duration-300">
                                                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] text-[13px] italic leading-relaxed text-primary/80 border-dashed">
                                                        <span className="font-bold uppercase text-[9px] block mb-1 opacity-60">Verified Answer</span>
                                                        {q.answer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Assessment Protocol</span>
                                <span>CONFIDENTIAL SCHEMA</span>
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
                            <HelpCircle className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Evaluation Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Configure the assessment parameters on the left to begin compiling nodes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
