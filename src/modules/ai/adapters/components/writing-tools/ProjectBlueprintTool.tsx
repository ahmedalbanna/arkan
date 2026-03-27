'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useProjectBlueprintLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-project-blueprint-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { Check, Copy, Loader2, Building2, Download, Layout, Target, Zap, Clock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

export function ProjectBlueprintTool() {
  const { t } = useLocalization();
  const {
    form,
    generateMutation,
    onSubmit,
    blueprint,
    isCopied,
    handleCopy,
    handleDownload,
  } = useProjectBlueprintLogic();

  const { register, setValue, formState: { errors } } = form;

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.projectBlueprint.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.projectBlueprint.cardDescription')}</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[850px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Layout className="h-3 w-3 text-primary" />
                                    Core Identity
                                </Label>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Input
                                            id="projectName"
                                            {...register('projectName')}
                                            placeholder="System Title / Name"
                                            className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl"
                                        />
                                        {errors.projectName && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{errors.projectName.message}</p>}
                                    </div>
                                    <Select onValueChange={(value) => setValue('projectType', value)}>
                                        <SelectTrigger className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                            <SelectValue placeholder="Solution Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="web-application" className="text-xs">Web Application</SelectItem>
                                            <SelectItem value="mobile-app" className="text-xs">Mobile App</SelectItem>
                                            <SelectItem value="e-commerce" className="text-xs">E-commerce Platform</SelectItem>
                                            <SelectItem value="saas" className="text-xs">SaaS Platform</SelectItem>
                                            <SelectItem value="api" className="text-xs">API Service</SelectItem>
                                            <SelectItem value="other" className="text-xs">Specialized Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Target className="h-3 w-3 text-primary" />
                                    Mission & Objectives
                                </Label>
                                <div className="space-y-4">
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        rows={3}
                                        placeholder="Define the primary problem and solution..."
                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                    />
                                    <Textarea
                                        id="targetAudience"
                                        {...register('targetAudience')}
                                        rows={2}
                                        placeholder="Identify key stakeholders and end-users..."
                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                    />
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-primary" />
                                    Technical Architecture
                                </Label>
                                <div className="space-y-4">
                                    <Select onValueChange={(value) => setValue('complexity', value as any)}>
                                        <SelectTrigger className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                            <SelectValue placeholder="Complexity Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Simple" className="text-xs">Standard (MVP Focus)</SelectItem>
                                            <SelectItem value="Medium" className="text-xs">Advanced (Full Scale)</SelectItem>
                                            <SelectItem value="Complex" className="text-xs">High Performance</SelectItem>
                                            <SelectItem value="Enterprise" className="text-xs">Enterprise Ecosystem</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Textarea
                                        id="features"
                                        {...register('features')}
                                        rows={3}
                                        placeholder="List critical capabilities and requirements..."
                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                    />
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-primary" />
                                    Strategic Timeline
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select onValueChange={(value) => setValue('budget', value)}>
                                        <SelectTrigger className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg">
                                            <SelectValue placeholder="Budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="under-5k" className="text-xs">Tier 1</SelectItem>
                                            <SelectItem value="5k-15k" className="text-xs">Tier 2</SelectItem>
                                            <SelectItem value="15k-50k" className="text-xs">Tier 3</SelectItem>
                                            <SelectItem value="over-50k" className="text-xs">Tier 4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select onValueChange={(value) => setValue('timeline', value)}>
                                        <SelectTrigger className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg">
                                            <SelectValue placeholder="Timeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-month" className="text-xs">Agile</SelectItem>
                                            <SelectItem value="3-months" className="text-xs">Quarterly</SelectItem>
                                            <SelectItem value="6-months" className="text-xs">Strategic</SelectItem>
                                            <SelectItem value="flexible" className="text-xs">Flexible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={generateMutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {generateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Building2 className="h-5 w-5" />}
                            Initialize Blueprint
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
                {(generateMutation.isPending || blueprint) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Constructed Architecture Blueprint</h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                            {generateMutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Architectural Synthesis</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                    <ReactMarkdown components={markdownComponents}>{blueprint}</ReactMarkdown>
                                </div>
                            )}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Architecture Engine</span>
                                <span>CONFIDENTIAL SCHEMA</span>
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <Building2 className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Architectural Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Define the solution identity and mission parameters on the left to begin synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
