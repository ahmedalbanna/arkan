
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

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { ShieldCheck, Rocket, Zap, Brain, Layers, Layout, Save, Terminal } from 'lucide-react';

export function OnboardingGuide({ isOpen, onOpenChange, onComplete }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);

  const steps = useMemo(() => [
    {
      title: 'Initialize Intelligence Protocol',
      description: "Welcome to the Arkan Document Suite. This manifest will guide you through our systematic production environment.",
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=PROTOCOL+INITIALIZED',
      icon: Terminal,
      tag: 'System Boot'
    },
    {
      title: 'Contextual Ingestion',
      description: 'Establish your source parameters. Upload high-fidelity documents or technical context into our secure RAG manager.',
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=INGESTION+FLOW',
      icon: Layers,
      tag: 'Knowledge Base'
    },
    {
      title: 'Architectural Blueprinting',
      description: 'Define your document hierarchy using our AI Architect. Map chapters and sections into a professional structural manifest.',
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=ARCHITECTURAL+MATRIX',
      icon: Layout,
      tag: 'Blueprint Node'
    },
    {
      title: 'Recursive Synthesis',
      description: "Configure technical parameters for individual sections. Derive high-fidelity content through multi-turn AI iteration.",
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=NEURAL+SYNTHESIS',
      icon: Brain,
      tag: 'AI Processing'
    },
    {
      title: 'Precision Refinement',
      description: "Polish your generated intelligence in our high-end canvas. Utilize specialized HUDs for zoom, tone, and logic validation.",
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=REFINE+CANVAS',
      icon: Zap,
      tag: 'Quality Control'
    },
    {
      title: 'Production Export',
      description: 'Finalize your intelligence into industry-standard formats. Export professional DOCX or PPTX manifests with a single click.',
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=EXPORT+MANIFEST',
      icon: Save,
      tag: 'Final Asset'
    },
    {
      title: 'Neural Credits',
      description: "Neural operations consume system credits. Monitor your high-level balance in the primary account HUD.",
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=CREDIT+QUOTA',
      icon: ShieldCheck,
      tag: 'Audit Trail'
    },
    {
      title: "Protocol Ready",
      description: "All systems synchronized. You are now authorized to begin systematic document production in the Arkan workspace.",
      imgSrc: 'https://placehold.co/600x400/0d1117/ffffff.png?text=DEPLOYMENT+READY',
      icon: Rocket,
      tag: 'Live Ops'
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

  const StepIcon = currentStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl rounded-[32px] bg-background">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <DialogTitle className="text-xl font-bold font-headline tracking-tight">Intelligence Induction Protocol</DialogTitle>
          </div>
          <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Step {step + 1} of {steps.length}
          </Badge>
        </header>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Visual Manifest (Left) */}
            <div className="md:w-1/2 p-10 bg-muted/5 border-r border-border/40 relative group overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-[1.02] transition-transform duration-700">
                    <Image
                        src={currentStep.imgSrc}
                        alt={currentStep.title}
                        layout="fill"
                        className="object-cover"
                    />
                    {/* UI Overlay */}
                    <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="h-5 text-[8px] font-bold uppercase tracking-widest bg-background/80 backdrop-blur-md border-none shadow-sm">
                            {currentStep.tag}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Content Logic (Right) */}
            <div className="md:w-1/2 p-10 flex flex-col">
                <div className="flex-1 space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner animate-in zoom-in-50 duration-500">
                        <StepIcon className="h-7 w-7" />
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold font-headline tracking-tight leading-tight uppercase tracking-widest text-foreground/90">{currentStep.title}</h2>
                        <p className="text-sm text-muted-foreground italic font-serif leading-relaxed opacity-80">
                            {currentStep.description}
                        </p>
                    </div>
                </div>

                <div className="mt-auto space-y-8">
                    <div className="flex items-center gap-1.5 px-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 transition-all duration-500 rounded-full",
                                    i === step ? "w-8 bg-primary" : "w-2 bg-muted/40"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {step > 0 && (
                            <Button 
                                variant="ghost" 
                                onClick={handlePrev} 
                                className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                <ArrowLeft className="me-2 h-3.5 w-3.5" />
                                Rollback
                            </Button>
                        )}
                        <Button 
                            onClick={handleNext} 
                            className="flex-1 h-12 rounded-xl font-bold shadow-xl shadow-primary/20 gap-2 transition-all active:scale-95"
                        >
                            {step === steps.length - 1 ? (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Authorize Induction
                                </>
                            ) : (
                                <>
                                    Next Protocol
                                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5">
            <p className="text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
                Arkan Induction Engine • V1.0 Stable
            </p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
