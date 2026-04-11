'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  PartyPopper,
  Pause,
  Play,
  SkipForward
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface OnboardingGuideProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
}

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import {
  Brain,
  Brush,
  Database,
  Layout,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal
} from 'lucide-react';

export function OnboardingGuide({ isOpen, onOpenChange, onComplete }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = useMemo(() => [
    {
      title: 'Initialize Intelligence Protocol',
      description: "Welcome to the Arkan Document Suite. This manifest will guide you through our systematic production environment.",
      longDescription: "The Arkan platform provides a comprehensive environment for AI-powered document generation. You'll learn how to create, structure, and generate professional documents using our neural engine.",
      imgSrc: '/onboarding/protocol-initialized.svg',
      icon: Terminal,
      tag: 'System Boot',
      color: 'from-blue-500/20 to-cyan-500/20',
      tips: ['Press Esc to skip', 'Use arrow keys to navigate', 'Click the dots to jump']
    },
    {
      title: 'Contextual Ingestion',
      description: 'Establish your source parameters. Upload high-fidelity documents or technical context into our secure RAG manager.',
      longDescription: 'Upload PDFs, DOCX, Markdown files, or paste text directly. The RAG system indexes your content to provide contextual intelligence for generation.',
      imgSrc: '/onboarding/ingestion-flow.svg',
      icon: Database,
      tag: 'Knowledge Base',
      color: 'from-purple-500/20 to-pink-500/20',
      tips: ['Supports PDF, DOCX, MD, TXT', 'Images can be uploaded as context', 'Files are processed locally']
    },
    {
      title: 'Architectural Blueprinting',
      description: 'Define your document hierarchy using our AI Architect. Map chapters and sections into a professional structural manifest.',
      longDescription: 'Create chapters and sections manually or use the AI Architect to generate a structure based on your project description. Drag and drop to reorganize.',
      imgSrc: '/onboarding/architectural-matrix.svg',
      icon: Layout,
      tag: 'Blueprint Node',
      color: 'from-green-500/20 to-emerald-500/20',
      tips: ['Use # for chapters', 'Use - for sections', 'Drag to reorder items']
    },
    {
      title: 'Recursive Synthesis',
      description: "Configure technical parameters for individual sections. Derive high-fidelity content through multi-turn AI iteration.",
      longDescription: 'Adjust tone, complexity, and output style for each section. Enable RAG to incorporate your uploaded sources. Generate content iteratively.',
      imgSrc: '/onboarding/neural-synthesis.svg',
      icon: Brain,
      tag: 'AI Processing',
      color: 'from-orange-500/20 to-red-500/20',
      tips: ['Adjust formality slider', 'Toggle RAG for context', 'Use guidelines for consistency']
    },
    {
      title: 'Precision Refinement',
      description: "Polish your generated intelligence in our high-end canvas. Utilize specialized HUDs for zoom, tone, and logic validation.",
      longDescription: 'Edit generated content directly in the rich text editor. Use the selection HUD for quick AI actions like summarization, expansion, and rewriting.',
      imgSrc: '/onboarding/refine-canvas.svg',
      icon: Brush,
      tag: 'Quality Control',
      color: 'from-yellow-500/20 to-amber-500/20',
      tips: ['Select text for AI actions', 'Use Ctrl+B for bold', 'Zoom in/out with Ctrl+Mouse wheel']
    },
    {
      title: 'Production Export',
      description: 'Finalize your intelligence into industry-standard formats. Export professional DOCX or PPTX manifests with a single click.',
      longDescription: 'Export your document as Markdown, PDF, or DOCX. Share with team members or download for offline use.',
      imgSrc: '/onboarding/export-manifest.svg',
      icon: Save,
      tag: 'Final Asset',
      color: 'from-indigo-500/20 to-purple-500/20',
      tips: ['Export as Markdown for editing', 'PDF for sharing', 'DOCX for Word compatibility']
    },
    {
      title: 'Neural Credits',
      description: "Neural operations consume system credits. Monitor your high-level balance in the primary account HUD.",
      longDescription: 'Each AI generation consumes credits based on complexity and RAG usage. Check your balance in the account panel.',
      imgSrc: '/onboarding/credit-quota.svg',
      icon: ShieldCheck,
      tag: 'Audit Trail',
      color: 'from-cyan-500/20 to-blue-500/20',
      tips: ['RAG costs 2x credits', 'Bulk generation saves credits', 'Monitor usage in real-time']
    },
    {
      title: "Protocol Ready",
      description: "All systems synchronized. You are now authorized to begin systematic document production in the Arkan workspace.",
      longDescription: "You're ready to create your first document! Start by creating a new project or loading an existing one.",
      imgSrc: '/onboarding/deployment-ready.svg',
      icon: Rocket,
      tag: 'Live Ops',
      color: 'from-violet-500/20 to-fuchsia-500/20',
      tips: ['Create a new project', 'Load a template', 'Import an existing document']
    },
  ], []);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && isOpen && step < steps.length - 1) {
      timer = setTimeout(() => {
        handleNext();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, isOpen, step, steps.length]);

  // Mark current step as completed when viewed
  useEffect(() => {
    if (isOpen && !completedSteps.has(step)) {
      setCompletedSteps(prev => new Set(prev).add(step));
    }
  }, [isOpen, step, completedSteps]);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  }, [step, steps.length, onComplete]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleJumpToStep = useCallback((index: number) => {
    setStep(index);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip, toggleAutoPlay]);

  if (!isOpen) return null;

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-2xl bg-background",
        "max-w-5xl w-[90vw] h-[80vh]"
      )}>
        {/* Header */}
        <header className="px-6 py-4 border-b border-primary/10 bg-muted/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <DialogTitle className="text-[14px] font-black font-headline tracking-tight">
              Intelligence Induction Protocol
            </DialogTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-5 text-[8px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
              Step {step + 1} of {steps.length}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleAutoPlay}
                    className="h-7 w-7 rounded-lg"
                  >
                    {isAutoPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[8px]">
                  {isAutoPlaying ? 'Pause' : 'Auto-play'} • Space
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="h-0.5 bg-primary/10">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/60 to-primary/30 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Visual Side */}
          <div className="md:w-1/2 p-6 bg-gradient-to-br from-muted/10 to-muted/5 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />

            <div className="relative h-full flex flex-col items-center justify-center">
              <div className={cn(
                "w-48 h-48 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl transition-all duration-500",
                currentStep.color
              )}>
                <StepIcon className="h-20 w-20 text-primary/60" />
              </div>

              {/* Tips Section */}
              <div className="mt-6 p-3 rounded-lg bg-primary/5 border border-primary/10 w-full">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  <span className="text-[7px] font-black uppercase tracking-wider text-muted-foreground/60">Pro Tips</span>
                </div>
                <ul className="space-y-1">
                  {currentStep.tips?.map((tip, idx) => (
                    <li key={idx} className="text-[8px] text-muted-foreground/60 flex items-center gap-1.5">
                      <Sparkles className="h-2 w-2 text-primary/40" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner animate-in zoom-in-50 duration-500">
                <StepIcon className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider border-primary/20 bg-primary/5">
                  {currentStep.tag}
                </Badge>
                <h2 className="text-xl font-black font-headline tracking-tight leading-tight text-foreground/90">
                  {currentStep.title}
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
                <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-primary/5">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic">
                    {currentStep.longDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-6 space-y-4">
              {/* Step Indicators */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {steps.map((_, i) => {
                  const isCompleted = completedSteps.has(i);
                  const isCurrent = i === step;

                  return (
                    <button
                      key={i}
                      onClick={() => handleJumpToStep(i)}
                      className={cn(
                        "h-6 px-2 rounded-md transition-all duration-200 text-[8px] font-black uppercase tracking-wider",
                        isCurrent && "bg-primary/10 text-primary",
                        isCompleted && !isCurrent && "text-green-500/60",
                        !isCompleted && !isCurrent && "text-muted-foreground/30 hover:text-muted-foreground/60"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1 h-10 rounded-lg text-[9px] font-black uppercase tracking-wider gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className={cn(
                    "flex-1 h-10 rounded-lg font-black uppercase tracking-wider gap-1.5 shadow-lg transition-all",
                    step === steps.length - 1 ? "bg-gradient-to-r from-primary to-primary/80" : "bg-primary"
                  )}
                >
                  {step === steps.length - 1 ? (
                    <>
                      <PartyPopper className="h-3.5 w-3.5" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        className="h-10 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[8px]">
                      Skip onboarding • Esc
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <footer className="px-6 py-2.5 border-t border-primary/10 bg-muted/5 flex items-center justify-between text-[7px] text-muted-foreground/40 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>Secure Protocol</span>
          </div>
          <div className="flex items-center gap-3">
            <span>← → Navigate</span>
            <span>•</span>
            <span>Esc Skip</span>
            <span>•</span>
            <span>Space Auto-play</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-2 w-2" />
            <span>{completedSteps.size}/{steps.length} viewed</span>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
