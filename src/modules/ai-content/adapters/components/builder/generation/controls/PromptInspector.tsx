'use client';

import React from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/hooks';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { PromptBuilder } from '@/modules/ai-content/domain/services/PromptBuilder';
import { container } from '@/infrastructure/di/container';

/**
 * PromptInspector — Technical debugging HUD for AI instructions.
 * Renders the final compiled prompt matrix for review and replication.
 */

interface PromptInspectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
}

export function PromptInspector({ isOpen, onOpenChange, section }: PromptInspectorProps) {
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
        
        {/* Technical HUD Header */}
        <header className="px-8 py-6 border-b border-primary/10 bg-primary/[0.03] relative overflow-hidden shrink-0">
          {/* Dot-grid atmosphere (28px standard) */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <DialogTitle className="text-[15px] font-black uppercase tracking-[0.2em]">AI Instruction Matrix</DialogTitle>
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70 tabular-nums">
                    {(fullPrompt.length / 1024).toFixed(1)} KB DATA
                  </span>
                </div>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground/60 font-medium leading-relaxed uppercase tracking-[0.2em]">
                Integrated neural vector for <span className="text-foreground font-black italic">"{section.title}"</span> — Composing Project Metadata + Context Vectors.
              </DialogDescription>
            </div>
          </div>
        </header>

        {/* Matrix Body — Monospace Code View */}
        <div className="flex-1 min-h-0 relative group bg-[#0d1117]/95 dark:bg-black/60 shadow-inner">
          {/* Action HUD — Floating Copy */}
          <div className="absolute top-6 right-8 z-30 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="h-9 px-4 gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-xl ring-1 ring-inset ring-white/20 transition-all hover:scale-105 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Manifest Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Instruction Set
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="h-[60vh] w-full custom-scrollbar">
            <div className="p-10 pb-24 relative">
              {/* Technical Code Line Indices Decoration */}
              <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/5 bg-white/[0.02] pointer-events-none" />
              
              <pre className="text-[13px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/80 selection:bg-primary/30 pl-6">
                {fullPrompt}
              </pre>
            </div>

            {/* Bottom ambient fade for deep focus */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] dark:from-black to-transparent pointer-events-none z-20" />
          </ScrollArea>
        </div>

        {/* Stable Version Footer */}
        <footer className="px-8 py-4 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FileCode className="h-3.5 w-3.5 text-muted-foreground/30" />
            <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                Arkan AI Engine · Instruction Pipeline
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-[10px] font-black uppercase tracking-[0.2em] h-8 px-5 rounded-xl transition-all hover:bg-muted/10 text-muted-foreground/60 hover:text-foreground"
          >
            Close Inspector
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
