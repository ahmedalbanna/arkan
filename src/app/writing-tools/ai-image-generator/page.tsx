
'use client';

import { AIImageGeneratorTool } from '@/modules/ai/adapters/components/writing-tools/AIImageGeneratorTool';
import { Image as ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export default function AiImageGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Background */}
      <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
              background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
          }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Vision Engine</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Generative Rendering</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
            <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            AI Image Generator
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80">
            Professional generative vision suite for synthesizing high-fidelity visual assets and custom illustrative logic from technical prompts.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <AIImageGeneratorTool />
        </div>
      </div>
    </div>
  );
}
