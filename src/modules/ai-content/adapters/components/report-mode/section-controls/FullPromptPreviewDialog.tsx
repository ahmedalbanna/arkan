'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useBuilderStore } from '@/hooks';

import type { Section } from '@/modules/ai-content/domain/entities/Section';
import { PromptBuilder } from '@/modules/ai-content/domain/services/PromptBuilder';
import { container } from '@/infrastructure/di/container';

interface FullPromptPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
}

export function FullPromptPreviewDialog({ isOpen, onOpenChange, section }: FullPromptPreviewDialogProps) {
  const { project } = useBuilderStore();
  const [copied, setCopied] = React.useState(false);

  if (!project) return null;

  const fullPrompt = container.resolve(PromptBuilder).buildSectionPrompt(section, project);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
        <header className="px-8 py-6 border-b bg-muted/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <DialogTitle className="text-xl font-bold font-headline tracking-tight">AI Instruction Manifest</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground italic max-w-2xl leading-relaxed">
              Below is the comprehensive instruction set being compiled for <span className="text-foreground font-bold not-italic">"{section.title}"</span>. This includes project-wide metadata, section-specific guidelines, linked context sources, and formatting rules.
            </DialogDescription>
          </div>
        </header>

        <div className="flex-1 min-h-0 relative group">
          {/* Action Overlay */}
          <div className="absolute top-4 right-8 z-20 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border shadow-sm flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Compiled Manifest</span>
              <div className="h-3 w-px bg-border" />
              <span className="text-[9px] font-bold text-primary">{(fullPrompt.length / 1024).toFixed(1)} KB</span>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="h-9 px-4 gap-2 font-bold shadow-lg shadow-primary/20"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Manifest Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Manifest
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="h-[65vh] w-full bg-[#0d1117] dark:bg-black/40">
            <div className="p-8 pb-20">
              <pre className="text-[13px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30">
                {fullPrompt}
              </pre>
            </div>
            
            {/* Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
          </ScrollArea>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Arkan Intelligent Engine • V1.0 Stable
          </p>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-[10px] font-bold uppercase tracking-wider h-8">
            Close Preview
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
