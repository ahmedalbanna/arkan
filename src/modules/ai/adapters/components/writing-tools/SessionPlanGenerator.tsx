
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { SessionPlanDisplay } from '@/modules/ai/adapters/components/writing-tools/SessionPlanDisplay';
import { useSessionPlanGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-session-plan-generator-logic';
import { Loader2 } from 'lucide-react';

import { BookOpen, Users, Clock, Zap, Target, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

export const SessionPlanGenerator = () => {
  const { form, mutation, result, onSubmit } = useSessionPlanGeneratorLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Session Strategy Manifest</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">
          Craft high-engagement, interactive instructional blueprints from your core curriculum or research data.
        </p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[850px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                        <BookOpen className="h-3 w-3 text-primary" />
                                        Source Curriculum
                                    </Label>
                                    <FormField
                                        control={form.control}
                                        name="chapterContent"
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Paste your lecture notes or chapter content..."
                                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[250px]"
                                                        {...field}
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
                                        <Users className="h-3 w-3 text-primary" />
                                        Target Audience
                                    </Label>
                                    <FormField
                                        control={form.control}
                                        name="targetAudience"
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., University students, Executives"
                                                        className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator className="bg-border/40" />

                                <div className="space-y-6">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-primary" />
                                        Engagement Parameters
                                    </Label>

                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="sessionDuration"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <div className="flex justify-between items-center px-1">
                                                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5">
                                                            <Clock className="h-3 w-3" /> Duration
                                                        </FormLabel>
                                                        <Badge variant="secondary" className="h-4.5 text-[9px]">{field.value} min</Badge>
                                                    </div>
                                                    <FormControl>
                                                        <Slider
                                                            min={10}
                                                            max={240}
                                                            step={5}
                                                            value={[field.value]}
                                                            onValueChange={(vals) => field.onChange(vals[0])}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="numActivities"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <div className="flex justify-between items-center px-1">
                                                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5">
                                                            <Target className="h-3 w-3" /> Activities
                                                        </FormLabel>
                                                        <Badge variant="secondary" className="h-4.5 text-[9px]">{field.value}</Badge>
                                                    </div>
                                                    <FormControl>
                                                        <Slider
                                                            min={1}
                                                            max={10}
                                                            step={1}
                                                            value={[field.value]}
                                                            onValueChange={(vals) => field.onChange(vals[0])}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                                {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                Initialize Strategy Build
                            </Button>
                        </form>
                    </Form>
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
                {(mutation.isPending || result) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Instructional Strategy</h3>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="pb-20">
                                {mutation.isPending ? (
                                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-40">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Architecting Strategy</p>
                                    </div>
                                ) : result && (
                                    <div className="space-y-8 animate-in fade-in duration-700">
                                        <div className="rounded-[32px] border bg-card shadow-2xl overflow-hidden ring-1 ring-black/5">
                                            <SessionPlanDisplay data={result} />
                                        </div>

                                        {/* Page Footer Visual */}
                                        <div className="mt-8 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                            <span>Arkan Strategy Engine</span>
                                            <span>STRATEGIC MANIFEST</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <Zap className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Strategy Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the source curriculum and engagement parameters on the left to begin synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
