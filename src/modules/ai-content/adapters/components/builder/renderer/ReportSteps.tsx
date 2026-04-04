'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { FileVideo, LayoutList, Bot, Brush, BookOpenCheck } from 'lucide-react';

export const ReportSteps = () => {
  const { t } = useLocalization();

  const steps = [
    {
      icon: <FileVideo className="h-5 w-5 text-primary" />,
      title: "1. Customize Cover Page",
      description: "Click on the text on the cover page to edit your project's title, description, and author details directly."
    },
    {
      icon: <LayoutList className="h-5 w-5 text-primary" />,
      title: "2. Insert Table of Contents",
      description: "Use the 'Add Chapter' button or paste a structure in the 'Generation Tools' to create your document's outline."
    },
    {
      icon: <Bot className="h-5 w-5 text-primary" />,
      title: "3. Apply a Template",
      description: "Apply a pre-defined template to structure your report and generate content for all sections with a single click."
    },
    {
      icon: <Brush className="h-5 w-5 text-primary" />,
      title: "4. Configure Generation Tools",
      description: "For each section, expand it to edit the AI prompt, add guidelines, and select context from other sections or files."
    },
    {
      icon: <BookOpenCheck className="h-5 w-5 text-primary" />,
      title: "5. Generate & Review",
      description: "Generate content by clicking the 'Generate' button on any section and review the results as they appear in the editor."
    }
  ];

  return (
    <div className="relative p-8 rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl overflow-hidden">
      {/* Dot-grid atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Getting Started</span>
        </div>
        <h3 className="text-xl font-semibold font-headline mb-1">{t('builder.reportGenerator.emptyStateTitle')}</h3>
        <p className="text-[12px] text-muted-foreground/70">{t('builder.reportGenerator.emptyStateDesc')}</p>
      </div>

      {/* Steps */}
      <div className="relative z-10 space-y-4">
        {/* Vertical connector line */}
        <div className="absolute left-[2.35rem] top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent pointer-events-none" />

        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-4 group/step relative"
          >
            {/* Step icon pill */}
            <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm group-hover/step:bg-primary/15 group-hover/step:border-primary/30 transition-all duration-300 relative z-10 bg-background">
              {step.icon}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1.5 min-w-0">
              <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground/80 group-hover/step:text-primary transition-colors duration-300 mb-0.5">
                {step.title}
              </h4>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
    </div>
  );
};
