'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { FileVideo, LayoutList, Bot, Brush, BookOpenCheck } from 'lucide-react';

export const ReportSteps = () => {
  const { t } = useLocalization();

  const steps = [
    {
      icon: <FileVideo className="h-6 w-6 text-primary" />,
      title: "1. Customize Cover Page",
      description: "Click on the text on the cover page to edit your project's title, description, and author details directly."
    },
    {
      icon: <LayoutList className="h-6 w-6 text-primary" />,
      title: "2. Insert Table of Contents",
      description: "Use the 'Add Chapter' button or paste a structure in the 'Generation Tools' to create your document's outline."
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "3. AI Generate Project Template",
      description: "Apply a pre-defined template to structure your report and generate content for all sections with a single click."
    },
    {
      icon: <Brush className="h-6 w-6 text-primary" />,
      title: "4. Customize Generation Tools",
      description: "For each section, expand it to edit the AI prompt, add guidelines, and select context from other sections or files."
    },
    {
      icon: <BookOpenCheck className="h-6 w-6 text-primary" />,
      title: "5. View Chapter and Section",
      description: "Generate content by clicking the 'Generate' button on any section and review the results as they appear in the editor."
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-10">
        <h3 className="text-xl font-semibold font-headline">{t('builder.reportGenerator.emptyStateTitle')}</h3>
        <p className="text-muted-foreground">{t('builder.reportGenerator.emptyStateDesc')}</p>
      </div>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
              {step.icon}
            </div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
