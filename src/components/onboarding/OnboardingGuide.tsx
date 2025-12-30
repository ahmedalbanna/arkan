
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Lightbulb, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

interface OnboardingGuideProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
}

export function OnboardingGuide({ isOpen, onOpenChange, onComplete }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);

  const steps = useMemo(() => [
    {
      title: 'Welcome to the Arkan Builder!',
      description: "Let's take a quick tour to see how you can use AI to build complex documents and reports.",
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'welcome illustration'
    },
    {
      title: '1. Add Your Context',
      description: 'Start by uploading files or pasting text into the File Manager. This context (like requirements, research, or data) is crucial for the AI to understand your project.',
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'upload document'
    },
    {
      title: '2. Structure Your Report',
      description: 'Use the Generation Tools panel to add and organize chapters and sections. You can generate a Table of Contents with AI or build it manually.',
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'report structure'
    },
    {
      title: '3. Generate Content with AI',
      description: "For each section, select the context you want the AI to use, adjust the controls (like tone and formality), and click 'Generate'.",
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'ai writing'
    },
    {
      title: '4. Edit and Refine',
      description: "Your generated content appears in the main editor. You can edit it directly, use the floating AI toolbar for quick actions, and see word counts.",
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'text editor'
    },
    {
      title: '5. Export Your Document',
      description: 'Once your report is complete, use the "Export" button to download it as a professionally formatted DOCX file.',
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'download document'
    },
    {
      title: 'Your AI Credits',
      description: "Keep an eye on your credit balance in the top right corner. Most AI generations cost credits, so manage them wisely!",
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'coin balance'
    },
    {
      title: "You're All Set!",
      description: "You're ready to start creating. Dive in and explore the power of Arkan's AI toolkit.",
      imgSrc: 'https://placehold.co/600x400.png',
      dataAiHint: 'rocket launch'
    },
  ], []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = steps[step];

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] w-[90vw] max-w-[90vw] md:w-full rounded-lg">
        <DialogHeader>
          <Image
            src={currentStep.imgSrc}
            alt={currentStep.title}
            width={600}
            height={400}
            className="w-full h-auto rounded-t-lg aspect-video object-cover"
            data-ai-hint={currentStep.dataAiHint}
          />
          <div className="p-6">
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              {step === 0 ? <PartyPopper className="w-6 h-6 text-primary" /> : <Lightbulb className="w-6 h-6 text-primary" />}
              {currentStep.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-base">
              {currentStep.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="p-6 pt-0 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center w-full gap-4">
          <div className="flex items-center gap-2 self-center sm:self-auto">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-between sm:justify-end w-full sm:w-auto">
            {step > 0 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1 sm:flex-none">
                <ArrowLeft className="me-2 h-4 w-4" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 sm:flex-none">
              {step === steps.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
