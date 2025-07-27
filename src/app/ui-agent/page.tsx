'use client';

import UIAgent from '@/components/ui-agent/UIAgent';
import { LayoutGrid } from 'lucide-react';

export default function UIAgentPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <LayoutGrid className="w-10 h-10" />
          AI UI Agent
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Describe the UI component you want to build, and let the AI bring it to life.
        </p>
      </div>
      <UIAgent />
    </div>
  );
}
