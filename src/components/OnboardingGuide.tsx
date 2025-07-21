
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Lightbulb, PartyPopper } from 'lucide-react';
import Image from 'next/image';

interface OnboardingGuideProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
}

export default function OnboardingGuide({ isOpen, onOpenChange, onComplete }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);

  const steps = useMemo(() => [
    {
      title: 'Welcome to Arkan!',
      description: "Let's take a quick tour to see how you can use AI to build amazing things.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'welcome illustration'
    },
    {
      title: '1. Proposal Mode',
      description: 'Start by describing your project idea. Our AI will generate a complete, professional proposal with objectives, timelines, and budgets.',
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'document idea'
    },
    {
      title: '2. Document Generator',
      description: 'Expand your proposal into a full-fledged report. Generate sections like introductions, system analysis, and conclusions with a single click.',
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'report generation'
    },
    {
      title: '3. Diagram Generator',
      description: 'Visualize your system. Create class diagrams, use cases, sequence diagrams, and more using simple text descriptions.',
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'flowchart diagram'
    },
    {
      title: '4. Code Generator',
      description: "Need a UI component? Describe what you want, and the AI will generate the HTML, CSS, and JavaScript for you.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'code editor'
    },
    {
      title: '5. Presentation Mode',
      description: 'Turn your generated content into a professional slide deck instantly, ready for your next big presentation.',
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'presentation slide'
    },
    {
      title: 'Your AI Credits',
      description: "Keep an eye on your credit balance in the top right corner. Most AI generations cost credits, so manage them wisely!",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'coin balance'
    },
    {
      title: "You're All Set!",
      description: "You're ready to start creating. Dive in and explore the power of Arkan's AI toolkit.",
      image: 'https://placehold.co/600x400.png',
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
            src={currentStep.image}
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
                <ArrowLeft className="mr-2 h-4 w-4" />
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
