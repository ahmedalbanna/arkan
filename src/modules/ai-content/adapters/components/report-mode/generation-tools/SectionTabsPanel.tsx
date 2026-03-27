'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { useAiActions } from '@/modules/ai-content/adapters/hooks/report-mode/use-ai-actions';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { cn } from '@/infrastructure/utils/cn';
import { Link as LinkIcon, Loader2, SlidersHorizontal, Sparkles, StickyNote } from 'lucide-react';
import { SectionContextSelector } from '../section-controls/SectionContextSelector';
import { SectionGenerationControls } from '../section-controls/SectionGenerationControls';
import { GuidelineEditor } from '../section-controls/SectionGuidelineEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SectionTabsPanelProps {
  section: Section | null;
  className?: string;
}

export function SectionTabsPanel({ section, className }: SectionTabsPanelProps) {
  const { t } = useLocalization();
  const { userProfile } = useBuilderStore();
  const { generateSectionMutation, generateChapterMutation, generateProjectMutation } = useAiActions();

  if (!section) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center space-y-4 text-center p-8", className)}>
        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No Section Active</h4>
          <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed">
            Select a section from the chapter list to begin configuring its AI parameters.
          </p>
        </div>
      </div>
    );
  }

  const activeSection = section;
  const isGenerating = generateSectionMutation?.isPending && generateSectionMutation.variables === activeSection.id;
  const isAnythingGenerating = generateSectionMutation?.isPending || generateChapterMutation.isPending || generateProjectMutation.isPending;
  const hasCredits = (userProfile?.credits ?? 0) >= 1;
  const canGenerate = hasCredits && !isAnythingGenerating;

  function handleGenerateClick() {
    if (!canGenerate) return;
    generateSectionMutation.mutate(activeSection.id);
  }

  return (
    <div className={cn("h-full flex flex-col min-h-0", className)}>
      <div className="px-4 pb-6 pt-2">
        <div className="flex flex-col gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Active Context</span>
            <h3 className="text-base font-bold font-headline truncate tracking-tight">{section.title}</h3>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleGenerateClick}
                  disabled={!canGenerate}
                  className="w-full font-bold h-10 gap-2 shadow-lg shadow-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {t('builder.reportGenerator.generateButton')}
                </Button>
              </TooltipTrigger>
              {!canGenerate && (
                <TooltipContent side="bottom" className="text-[10px]">
                  <p>{isAnythingGenerating ? "Another generation is in progress." : "Insufficient credits."}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="context" className="w-full flex-1 flex flex-col min-h-0">
        <div className="px-4">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-3 h-9 rounded-lg bg-muted/30 p-1 gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="context" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-2 transition-all">
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Context</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]"><p>Data Sources</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="prompt" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-2 transition-all">
                    <StickyNote className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Prompt</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]"><p>Guidelines</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="controls" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-2 transition-all">
                    <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Output</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]"><p>Parameters</p></TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>
        </div>

        <div className="flex-1 overflow-hidden relative mt-2">
          <ScrollArea className="h-full px-4 pr-4 -mr-4">
            <div className="pb-20 pt-4">
              <TabsContent value="context" className="m-0 focus-visible:ring-0">
                 <SectionContextSelector sectionId={section.id} />
              </TabsContent>
              <TabsContent value="prompt" className="m-0 focus-visible:ring-0">
                 <GuidelineEditor itemKey={section.id} />
              </TabsContent>
              <TabsContent value="controls" className="m-0 focus-visible:ring-0">
                 <SectionGenerationControls section={section} />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
