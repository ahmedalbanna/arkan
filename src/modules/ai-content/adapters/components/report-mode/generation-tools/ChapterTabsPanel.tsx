'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { cn } from '@/infrastructure/utils/cn';
import { Link as LinkIcon, Loader2, Wand2, Edit, PlusCircle, Layout } from 'lucide-react';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useChapterActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-chapter-actions';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { SidebarContainer } from '../layout/SidebarContainer';

interface ChapterTabsPanelProps {
  chapter: Chapter | null;
  className?: string;
  onClose?: () => void;
}

export function ChapterTabsPanel({ chapter, className, onClose }: ChapterTabsPanelProps) {
  const { t } = useLocalization();
  const {
    form,
    manipulationType,
    setManipulationType,
    manipulationTypes,
    styles,
    compressionRatio,
    setCompressionRatio,
    onSubmit,
    isProcessing,
    processedText,
    handleApplyToNewSection,
  } = useChapterActions(chapter, () => { });

  if (!chapter) {
    return (
      <SidebarContainer title="Chapter Tools" icon={<Layout className="h-3 w-3" />}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-20">
            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center border border-border/40">
                <Layout className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Chapter Selected</h4>
                <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed max-w-[200px]">
                    Select a chapter from the architect to apply bulk neural transformations.
                </p>
            </div>
        </div>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer 
        title="Chapter Neural Ops" 
        icon={<Layout className="h-3 w-3" />}
    >
        <div className="space-y-8 relative">
            {/* Chapter Identity Zone */}
            <div className="flex flex-col gap-4">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Neural Sequence</span>
                    <h3 className="text-[13px] font-black uppercase truncate tracking-widest text-foreground/90">{chapter.title}</h3>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <Button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full font-black h-11 gap-2 shadow-xl shadow-primary/10 rounded-xl uppercase tracking-[0.15em] text-[10px] relative overflow-hidden group/gen"
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            Process Sequence
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/gen:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </Button>

                        {processedText && !isProcessing && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyToNewSection}
                                className="w-full font-black h-10 gap-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl uppercase tracking-widest text-[9px] transition-all"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                Commit to New Node
                            </Button>
                        )}
                    </form>
                </Form>
            </div>

            {/* Neural Logic Configuration */}
            <Tabs defaultValue="actions" className="w-full flex flex-col gap-6">
                <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl bg-muted/20 p-1 gap-1 border border-border/40 backdrop-blur-md">
                    <TabsTrigger value="actions" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        <Edit className="h-3 w-3 shrink-0" />
                        <span className="truncate">Logic</span>
                    </TabsTrigger>
                    <TabsTrigger value="context" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        <LinkIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">Intel</span>
                    </TabsTrigger>
                </TabsList>

                <div className="relative min-h-[300px]">
                    <TabsContent value="actions" className="m-0 focus-visible:ring-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Logic Transformation</Label>
                                <Select value={manipulationType} onValueChange={(v) => setManipulationType(v as any)}>
                                    <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl focus:ring-primary/20 transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/40">
                                        {manipulationTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value} className="text-[11px] font-medium py-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {manipulationType === 'rewrite' && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Dimensional Style</Label>
                                    <Select onValueChange={(val) => form.setValue('rewriteStyle', val)} defaultValue={form.getValues('rewriteStyle')}>
                                        <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl">
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40">
                                            {styles.map(s => <SelectItem key={s} value={s} className="text-[11px] font-medium py-2">{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {manipulationType === 'summarize' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Compression Delta</Label>
                                        <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary">{compressionRatio}%</Badge>
                                    </div>
                                    <div className="px-1">
                                        <Slider value={[compressionRatio]} onValueChange={(v) => setCompressionRatio(v[0])} min={10} max={90} step={5} className="py-2" />
                                    </div>
                                </div>
                            )}

                            {manipulationType === 'style-editor' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Target Vector</Label>
                                        <Input {...form.register('targetAudience')} placeholder="e.g., General, Technical, Executive" className="h-10 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Logic Tone</Label>
                                        <Input {...form.register('tone')} placeholder="e.g., Clinical, Persuasive, Narrative" className="h-10 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl" />
                                    </div>
                                </div>
                            )}

                            {manipulationType === 'readability-enhancer' && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Cognitive Level</Label>
                                    <Select onValueChange={(val) => form.setValue('targetLevel', val)} defaultValue={form.getValues('targetLevel')}>
                                        <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/20 border-border/40 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40">
                                            <SelectItem value="elementary" className="text-[11px] font-medium py-2">Elementary</SelectItem>
                                            <SelectItem value="middle-school" className="text-[11px] font-medium py-2">Intermediate</SelectItem>
                                            <SelectItem value="high-school" className="text-[11px] font-medium py-2">Advanced</SelectItem>
                                            <SelectItem value="college" className="text-[11px] font-medium py-2">Undergraduate</SelectItem>
                                            <SelectItem value="graduate" className="text-[11px] font-medium py-2">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <Separator className="bg-border/40" />

                        <div className="p-4 rounded-2xl border border-dashed border-border/60 bg-muted/5 text-center space-y-2">
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                Committing these transformations will process all neural nodes within this sequence simultaneously.
                            </p>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="context" className="m-0 focus-visible:ring-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Collective Intel Sources</span>
                            <SectionContextSelector sectionId={chapter.id || ''} />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    </SidebarContainer>
  );
}
