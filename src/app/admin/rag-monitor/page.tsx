/**
 * RAG Monitoring Dashboard Page
 * 
 * Admin page for monitoring RAG system health and performance
 */

import { RAGHealthMonitor } from '@/modules/rag/adapters/components/rag/RAGHealthMonitor';
import { RAGStatsPanel } from '@/modules/rag/adapters/components/rag/RAGStatsPanel';
import { RAGQueryTester } from '@/modules/rag/adapters/components/rag/RAGQueryTester';

import { Badge } from '@/components/ui/badge';
import { Activity, ShieldCheck, Database, Cpu } from 'lucide-react';

export default function RAGMonitorPage() {
  return (
    <div className="flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Oversight Node</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1.5">
                <Activity className="h-3 w-3 fill-primary" />
                Real-time Monitoring
              </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-foreground flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
              RAG System Monitor
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
              Analyze the health, performance, and retrieval accuracy of your semantic intelligence engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-background border shadow-sm flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Gateway Node</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1 uppercase tracking-tighter">
                    Encrypted Pipeline
                </span>
            </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        
        <div className="grid gap-10">
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Vital Statistics</h3>
                </div>
                <div className="grid gap-8">
                    <RAGHealthMonitor />
                    <RAGStatsPanel />
                </div>
            </section>

            <section className="space-y-6 pt-10 border-t border-border/40">
                <div className="flex items-center gap-3 px-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Diagnostic Lab</h3>
                </div>
                <RAGQueryTester />
            </section>
        </div>
      </div>
    </div>
  );
}
