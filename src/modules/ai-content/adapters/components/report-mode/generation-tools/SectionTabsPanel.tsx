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
      <div className={cn("flex h-full items-center justify-center rounded-lg border bg-muted/10 p-6 text-sm text-muted-foreground", className)}>
        Select a section to edit its controls, prompt, and context.
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
    <div className={cn("h-full rounded-lg border bg-background shadow-sm flex flex-col", className)}>
      <div className="border-b px-4 py-4 bg-muted/10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Active Section</p>
            <h3 className="text-sm font-semibold truncate">{section.title}</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleGenerateClick} disabled={!canGenerate} size="sm">
                  {isGenerating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                  {t('builder.reportGenerator.generateButton')}
                </Button>
              </TooltipTrigger>
              {!canGenerate && (
                <TooltipContent>
                  <p>{isAnythingGenerating ? "Another generation is in progress." : "Insufficient credits."}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Tabs defaultValue="controls" className="w-full flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted/20 p-1 gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="controls" className="gap-2 text-[11px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-2">
                    <SlidersHorizontal className="h-4 w-4 shrink-0" />
                    <span className="truncate">Controls</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent><p>Controls</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="prompt" className="gap-2 text-[11px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-2">
                    <StickyNote className="h-4 w-4 shrink-0" />
                    <span className="truncate">Prompt</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent><p>Edit Prompt</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="context" className="gap-2 text-[11px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm px-2">
                    <LinkIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('builder.reportGenerator.tool_tab_context')}</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent><p>{t('builder.reportGenerator.tool_tab_context')}</p></TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>
        </div>
        <div className="px-4 flex-1 overflow-auto">
          <TabsContent value="controls" className="py-4">
            <div className="rounded-lg border bg-card p-4 sm:p-5">
              <SectionGenerationControls section={section} />
            </div>
          </TabsContent>
          <TabsContent value="prompt" className="py-4">
            <div className="rounded-lg border bg-card p-4 sm:p-5">
              <GuidelineEditor itemKey={section.id} />
            </div>
          </TabsContent>
          <TabsContent value="context" className="py-4">
            <div className="rounded-lg border bg-card p-4 sm:p-5">
              <SectionContextSelector sectionId={section.id} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
