'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal } from 'lucide-react';
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-border/40 shadow-2xl rounded-[24px]">

        {/* Header */}
        <header className="px-8 py-5 border-b border-border/40 bg-background/60 backdrop-blur-2xl relative overflow-hidden">
          {/* Dot-grid atmosphere */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-0.5">
                <DialogTitle className="text-[15px] font-bold tracking-tight">AI Prompt Preview</DialogTitle>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    {(fullPrompt.length / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground leading-relaxed">
                Full instruction set for <span className="text-foreground font-semibold not-italic">"{section.title}"</span> — includes project metadata, section parameters, and context links.
              </DialogDescription>
            </div>
          </div>
        </header>

        {/* Prompt body */}
        <div className="flex-1 min-h-0 relative group">
          {/* Copy button — always visible at reduced opacity, brightens on hover */}
          <div className="absolute top-4 right-6 z-20 opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3.5 gap-2 text-[9px] font-black uppercase tracking-[0.18em] shadow-lg shadow-primary/20 rounded-lg"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="h-[60vh] w-full bg-[#0d1117] dark:bg-black/40">
            <div className="p-8 pb-20">
              <pre className="text-[13px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30">
                {fullPrompt}
              </pre>
            </div>

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d1117] dark:from-black/40 to-transparent pointer-events-none" />
          </ScrollArea>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3.5 border-t border-border/40 bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
            Arkan AI Engine · v1.0
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-[9px] font-black uppercase tracking-[0.18em] h-7 px-4 rounded-lg transition-all hover:bg-muted text-muted-foreground"
          >
            Close
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
