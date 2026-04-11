'use client';

import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Brush,
  CheckCircle2,
  ChevronRight,
  FileVideo,
  LayoutList,
  PlayCircle,
  Sparkles
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  completed?: boolean;
}

export const ReportSteps = () => {
  const { t } = useLocalization();
  const isDesktop = !useMobile();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStepClick = useCallback((index: number) => {
    setActiveStep(activeStep === index ? null : index);
  }, [activeStep]);

  const handleStepComplete = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const steps: Step[] = [
    {
      icon: <FileVideo className="h-5 w-5" />,
      title: "1. Customize Cover Page",
      description: "Click on the text on the cover page to edit your project's title, description, and author details directly.",
      action: {
        label: "Edit Cover Page",
        onClick: () => {
          const coverPage = document.querySelector('[data-cover-page]');
          if (coverPage) {
            coverPage.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    },
    {
      icon: <LayoutList className="h-5 w-5" />,
      title: "2. Insert Table of Contents",
      description: "Use the 'Add Chapter' button or paste a structure in the 'Generation Tools' to create your document's outline.",
      action: {
        label: "Add Chapter",
        onClick: () => {
          const addButton = document.querySelector('[data-add-chapter]');
          if (addButton) {
            (addButton as HTMLElement).click();
          }
        }
      }
    },
    {
      icon: <Bot className="h-5 w-5" />,
      title: "3. Apply a Template",
      description: "Apply a pre-defined template to structure your report and generate content for all sections with a single click.",
      action: {
        label: "Browse Templates",
        onClick: () => {
          const templatesTab = document.querySelector('[data-templates-tab]');
          if (templatesTab) {
            (templatesTab as HTMLElement).click();
          }
        }
      }
    },
    {
      icon: <Brush className="h-5 w-5" />,
      title: "4. Configure Generation Tools",
      description: "For each section, expand it to edit the AI prompt, add guidelines, and select context from other sections or files.",
      action: {
        label: "Configure Settings",
        onClick: () => {
          const settingsPanel = document.querySelector('[data-generation-settings]');
          if (settingsPanel) {
            settingsPanel.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    },
    {
      icon: <BookOpenCheck className="h-5 w-5" />,
      title: "5. Generate & Review",
      description: "Generate content by clicking the 'Generate' button on any section and review the results as they appear in the editor.",
      action: {
        label: "Start Generating",
        onClick: () => {
          const generateButton = document.querySelector('[data-generate-section]');
          if (generateButton) {
            (generateButton as HTMLElement).click();
          }
        }
      }
    }
  ];

  const completedCount = completedSteps.size;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;

  return (
    <div className={cn(
      "relative rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl overflow-hidden transition-all duration-700",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    )}>
      {/* Dot-grid atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 via-transparent to-transparent pointer-events-none" />

      {/* Progress Bar - Desktop */}
      {isDesktop && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/60 to-primary/30 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 text-center pt-8 px-6 pb-6">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 shadow-sm">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">
            Getting Started Guide
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-black font-headline tracking-tight mb-2">
          {t('builder.reportGenerator.emptyStateTitle') || 'Create Your First Document'}
        </h3>
        <p className="text-[12px] text-muted-foreground/70 max-w-md mx-auto">
          {t('builder.reportGenerator.emptyStateDesc') || 'Follow these steps to build your report structure and generate AI-powered content.'}
        </p>

        {/* Progress Stats - Desktop */}
        {isDesktop && completedCount > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground/40">
            <span>{completedCount} of {totalSteps} steps completed</span>
            <span>•</span>
            <span className="text-primary/60">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="relative z-10 px-6 pb-8">
        {/* Vertical connector line */}
        <div className="absolute left-[2.35rem] top-20 bottom-20 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent pointer-events-none hidden sm:block" />

        <div className="space-y-5">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isActive = activeStep === index;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={index}
                className={cn(
                  "relative group/step transition-all duration-300",
                  isActive && "scale-[1.02]",
                  isDesktop && "cursor-pointer"
                )}
                onClick={() => handleStepClick(index)}
              >
                <div className="flex items-start gap-4">
                  {/* Step icon pill with completion status */}
                  <div className="shrink-0 relative">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 relative z-10",
                      isCompleted
                        ? "bg-green-500/10 border-green-500/30 text-green-500"
                        : "bg-primary/10 border border-primary/20 text-primary",
                      isDesktop && "group-hover/step:bg-primary/15 group-hover/step:border-primary/30 group-hover/step:scale-105"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>

                    {/* Completion toggle button - Desktop */}
                    {isDesktop && !isCompleted && (
                      <button
                        onClick={(e) => handleStepComplete(index, e)}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border border-primary/20 flex items-center justify-center opacity-0 group-hover/step:opacity-100 transition-opacity hover:bg-primary/10"
                        aria-label="Mark as complete"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary/60" />
                      </button>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-2 min-w-0">
                    <div className="flex items-center flex-wrap gap-3 mb-1">
                      <h4 className={cn(
                        "text-[12px] font-black uppercase tracking-[0.18em] transition-colors duration-300",
                        isCompleted ? "text-muted-foreground/40 line-through" : "text-foreground/80 group-hover/step:text-primary"
                      )}>
                        {step.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-[8px] font-mono text-green-500/60 bg-green-500/10 px-1.5 py-0.5 rounded">
                          Done
                        </span>
                      )}
                    </div>

                    <p className={cn(
                      "text-[11px] leading-relaxed font-medium transition-all duration-300",
                      isCompleted ? "text-muted-foreground/40" : "text-muted-foreground/70",
                      isActive && "text-foreground/80"
                    )}>
                      {step.description}
                    </p>

                    {/* Action button - Desktop */}
                    {isDesktop && step.action && !isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          step.action?.onClick();
                          handleStepComplete(index, e);
                        }}
                        className="mt-3 h-7 px-3 text-[9px] font-black uppercase tracking-wider gap-1.5 rounded-lg hover:bg-primary/10 group/btn"
                      >
                        {step.action.label}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    )}
                  </div>

                  {/* Expand indicator */}
                  {isDesktop && (
                    <div className="shrink-0 pt-3 opacity-0 group-hover/step:opacity-100 transition-opacity">
                      <ChevronRight className={cn(
                        "h-4 w-4 text-muted-foreground/30 transition-transform duration-300",
                        isActive && "rotate-90"
                      )} />
                    </div>
                  )}
                </div>

                {/* Expanded description - Desktop */}
                {isDesktop && isActive && (
                  <div className="mt-3 ml-16 pl-4 border-l-2 border-primary/20 animate-in slide-in-from-left-2 fade-in duration-300">
                    <div className="bg-primary/[0.02] rounded-lg p-3 text-[10px] text-muted-foreground/60 leading-relaxed">
                      <span className="font-bold text-primary/80">Pro tip:</span> {getProTip(index)}
                    </div>
                  </div>
                )}

                {/* Connector line between steps */}
                {!isLast && isDesktop && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Celebration - Desktop */}
      {isDesktop && completedCount === totalSteps && totalSteps > 0 && (
        <div className="relative z-10 mx-6 mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 text-center animate-in zoom-in-95 fade-in duration-500">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              🎉 All steps completed! You're ready to generate your document.
            </span>
            <Button
              size="sm"
              className="h-7 px-3 text-[9px] font-black uppercase tracking-wider gap-1.5"
              onClick={() => {
                const generateButton = document.querySelector('[data-generate-project]');
                if (generateButton) {
                  (generateButton as HTMLElement).click();
                }
              }}
            >
              <PlayCircle className="h-3 w-3" />
              Start Generation
            </Button>
          </div>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />

      {/* Quick Stats - Desktop */}
      {isDesktop && (
        <div className="relative z-10 border-t border-primary/10 px-6 py-3 flex items-center justify-between text-[8px] text-muted-foreground/40">
          <div className="flex items-center gap-3">
            <span>Interactive guide</span>
            <span>•</span>
            <span>Click steps to expand</span>
            <span>•</span>
            <span>Mark as you progress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for pro tips
function getProTip(stepIndex: number): string {
  const tips = [
    "You can upload your institution logo and customize the cover page layout from the style selector in the top-right corner.",
    "Use markdown syntax (# for chapters, - for sections) to quickly build your document structure.",
    "Templates include pre-configured AI prompts and guidelines - they're a great starting point for complex documents.",
    "Enable RAG (Retrieval-Augmented Generation) to incorporate uploaded files and external sources into generation.",
    "Use the selection HUD for quick AI actions on specific text passages without regenerating entire sections."
  ];
  return tips[stepIndex] || "Explore the sidebar panels to access all AI-powered features.";
}
