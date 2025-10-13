
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { AITextTune } from '@/components/writing-tools/AITextTune';
import { PenSquare } from 'lucide-react';

export default function TextStylistPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12">
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                <PenSquare className="w-10 h-10 text-white" />
              </div>
              TextStylist.ai
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Refine your writing by rewriting text in various styles or summarizing it to a specific length.
            </p>
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={300}>
          <AITextTune />
        </AnimatedContainer>
      </div>
    </div>
  );
}
