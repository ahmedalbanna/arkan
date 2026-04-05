'use client';

import { AIToolCard } from '@/modules/ai/adapters/components/writing-tools/AIToolCard';
import { useLocalization } from '@/context/LocalizationContext';
import { PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function WritingToolsPage() {
  const { t } = useLocalization();

  const tools = [
    { id: 'text-stylist', title: t('writingTools.cards.textStylist'), icon: PenSquare, description: 'Elevate text formality and tone.', vector: 'V1.2' },
    { id: 'document-writer', title: t('writingTools.cards.documentWriter'), icon: PenSquare, description: 'Synthesize full-length technical reports.', vector: 'V2.1' },
    { id: 'summarizer', title: t('writingTools.cards.aiSummarizer'), icon: PenSquare, description: 'Generate logical context summaries from large files.', vector: 'V1.0' },
    // ... Additional tools will be mapped following this strict AIToolCard schema
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* 28px Dot-grid Atmosphere */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none z-0" 
        style={{ 
            backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '28px 28px' 
        }} 
      />

      <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background shadow-inner">The Arsenal</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Neural Node Matrix</span>
          </div>

          <h1 className="text-5xl md:text-[90px] font-headline font-black tracking-tighter text-foreground leading-[0.82] uppercase">
            {t('writingTools.pageTitle')}
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80 font-medium">
            {t('writingTools.pageSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {tools.map((tool) => (
            <AIToolCard 
                key={tool.id} 
                id={tool.id}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                vector={tool.vector}
                onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
