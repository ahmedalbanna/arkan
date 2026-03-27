'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { cn } from '@/infrastructure/utils/cn';
import { Link as LinkIcon, Loader2, Wand2, Edit, PlusCircle, Layout } from 'lucide-react';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useChapterActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-chapter-actions';
import { Separator } from '@/components/ui/separator';

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
  } = useChapterActions(chapter, () => {});

  if (!chapter) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center space-y-4 text-center p-8", className)}>
        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center">
          <Layout className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No Chapter Active</h4>
          <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed">
            Select a chapter from the list to apply bulk AI actions to all its sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col min-h-0", className)}>
      <div className="px-4 pb-6 pt-2">
        <div className="flex flex-col gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Chapter Intelligence</span>
            <h3 className="text-base font-bold font-headline truncate tracking-tight">{chapter.title}</h3>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Button 
                type="submit"
                disabled={isProcessing} 
                className="w-full font-bold h-10 gap-2 shadow-lg shadow-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Process Chapter
              </Button>
              
              {processedText && !isProcessing && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleApplyToNewSection} 
                  className="w-full font-bold h-9 gap-2 border bg-background/50"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Save as New Section
                </Button>
              )}
            </form>
          </Form>
        </div>
      </div>

      <Tabs defaultValue="actions" className="w-full flex-1 flex flex-col min-h-0">
        <div className="px-4">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-2 h-9 rounded-lg bg-muted/30 p-1 gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="actions" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-2 transition-all">
                    <Edit className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Actions</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]"><p>Manipulation Tools</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="context" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-2 transition-all">
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Context</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]"><p>Data Sources</p></TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>
        </div>

        <div className="flex-1 overflow-hidden relative mt-2">
          <ScrollArea className="h-full px-4 pr-4 -mr-4">
            <div className="pb-20 pt-4">
              <TabsContent value="actions" className="m-0 focus-visible:ring-0 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Manipulation Type</Label>
                    <Select value={manipulationType} onValueChange={(v) => setManipulationType(v as any)}>
                      <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {manipulationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-xs">{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {manipulationType === 'rewrite' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Rewrite Style</Label>
                      <Select onValueChange={(val) => form.setValue('rewriteStyle', val)} defaultValue={form.getValues('rewriteStyle')}>
                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select style" /></SelectTrigger>
                        <SelectContent>
                          {styles.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {manipulationType === 'summarize' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Compression Ratio</Label>
                        <Badge variant="secondary" className="h-4.5 text-[10px] px-1.5">{compressionRatio}%</Badge>
                      </div>
                      <Slider value={[compressionRatio]} onValueChange={(v) => setCompressionRatio(v[0])} min={10} max={90} step={5} />
                    </div>
                  )}

                  {manipulationType === 'style-editor' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Target Audience</Label>
                        <Input {...form.register('targetAudience')} placeholder="e.g., general public, academics" className="h-9 text-xs bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Desired Tone</Label>
                        <Input {...form.register('tone')} placeholder="e.g., professional, casual" className="h-9 text-xs bg-background" />
                      </div>
                    </div>
                  )}

                  {manipulationType === 'readability-enhancer' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Target Reading Level</Label>
                      <Select onValueChange={(val) => form.setValue('targetLevel', val)} defaultValue={form.getValues('targetLevel')}>
                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elementary" className="text-xs">Elementary</SelectItem>
                          <SelectItem value="middle-school" className="text-xs">Middle School</SelectItem>
                          <SelectItem value="high-school" className="text-xs">High School</SelectItem>
                          <SelectItem value="college" className="text-xs">College</SelectItem>
                          <SelectItem value="graduate" className="text-xs">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {manipulationType === 'conciseness-checker' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Target Reduction</Label>
                        <Badge variant="secondary" className="h-4.5 text-[10px] px-1.5">{form.watch('targetReduction') || 0}%</Badge>
                      </div>
                      <Slider value={[form.watch('targetReduction') || 0]} onValueChange={(val) => form.setValue('targetReduction', val[0])} min={0} max={50} step={5} />
                    </div>
                  )}

                  {manipulationType === 'clarity-advisor' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Focus Areas</Label>
                      <Input {...form.register('focusAreas')} placeholder="e.g., sentence structure, word choice" className="h-9 text-xs bg-background" />
                    </div>
                  )}
                </div>

                <Separator className="bg-border/40" />

                <div className="p-4 rounded-xl border bg-muted/10 border-dashed text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    Actions applied here will process all sections within this chapter simultaneously.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="context" className="m-0 focus-visible:ring-0">
                 <SectionContextSelector sectionId={chapter.id || ''} />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
