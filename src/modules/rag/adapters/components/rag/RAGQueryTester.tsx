'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { 
    Search, 
    Zap, 
    ShieldCheck, 
    Database, 
    Clock, 
    Cpu, 
    Layers, 
    Binary, 
    FileText,
    ArrowRight,
    AlertCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useRagRetrieval } from '@/modules/rag/adapters/hooks/use-rag-retrieval';
import { cn } from '@/infrastructure/utils/cn';

/**
 * RAGQueryTester — High-fidelity auditor for neural retrieval vectors.
 * Allows deep inspection of retrieval latency, cache vectors, and result precision.
 * 
 * DEFENSIVE MEASURES:
 * 1. Telemetry Inspection: Visualizes per-phase timing (Embedding, Search, Rerank).
 * 2. Vector Context: Displays match scores and source metadata with high precision.
 * 3. Cache Feedback: Explicitly badges results resolved from the LRU matrix.
 * 4. UX Integrity: Responsive dot-grids and technical typography.
 */

interface SearchSource {
  text: string;
  score: number;
  fileName?: string;
  type?: string;
}

export function RAGQueryTester(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { retrieve, results, isLoading, error } = useRagRetrieval();

  // Derived Telemetry stats from the results payload
  const telemetry = useMemo(() => results?.telemetry, [results]);

  const handleRunQuery = useCallback(async () => {
    if (!query.trim()) return;
    await retrieve(query);
  }, [query, retrieve]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 relative">
      {/* 28px Dot-grid Background Atmospheric Layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none -m-10" 
        style={{ backgroundSize: '28px 28px' }}
      />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background">Vector Auditor</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Retrieval Simulation</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground flex items-center gap-4">
              <Search className="w-10 h-10 text-primary" />
              Query Inspector
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
                Execute spectral searches to validate retrieval precision and inspect neural telemetry vectors.
            </p>
          </div>
        </div>
      </header>

      {/* Input Sector — High-Density Search Control */}
      <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative z-10">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
        <CardContent className="p-10">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Input
                        placeholder="SCAN_TARGET_QUERY..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                        className="h-14 pl-12 text-[13px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl shadow-inner transition-all uppercase tracking-widest"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                </div>
                <Button 
                    onClick={handleRunQuery} 
                    disabled={isLoading || !query.trim()}
                    className="h-14 px-10 text-[11px] font-black uppercase tracking-[0.25em] gap-3 shadow-2xl shadow-primary/20 bg-primary hover:opacity-90 rounded-2xl transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                    Initialize Audit
                </Button>
            </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700 relative z-10">
            {/* Telemetry Sector — Timing & Cache Status */}
            <div className="space-y-6">
                <div className="flex items-center gap-2.5 px-1 group/label">
                    <Binary className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Neural Telemetry</span>
                </div>

                <div className="p-8 rounded-[32px] border border-border/60 bg-background/60 backdrop-blur-xl space-y-8 shadow-xl">
                    {/* Overall Status */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Total Cycle Time</span>
                            <div className="text-3xl font-black tracking-tighter tabular-nums">{telemetry?.totalTimeMs.toFixed(1)}ms</div>
                        </div>
                        {telemetry?.isCached && (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                Cached Node
                            </Badge>
                        )}
                    </div>

                    <Separator className="bg-primary/5" />

                    {/* Phase Breakdown */}
                    <div className="space-y-5">
                        {[
                            { label: 'Embedding Generation', val: telemetry?.embeddingTimeMs, max: 200, icon: <Binary /> },
                            { label: 'Vector Matrix Search', val: telemetry?.searchTimeMs, max: 100, icon: <Database /> },
                            { label: 'Neural Reranking', val: telemetry?.rerankTimeMs, max: 1000, icon: <Layers />, skipped: telemetry?.rerankSkipped }
                        ].map((phase, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground/60 flex items-center gap-2">
                                        {React.isValidElement(phase.icon) && React.cloneElement(phase.icon as React.ReactElement, { className: 'h-3 w-3 opacity-40' })}
                                        {phase.label}
                                    </span>
                                    <span className={cn(phase.skipped ? "text-green-500" : "text-primary/80")}>
                                        {phase.skipped ? 'OPTIMIZED' : `${phase.val?.toFixed(1)}ms`}
                                    </span>
                                </div>
                                <Progress value={phase.skipped ? 0 : (phase.val || 0) / phase.max * 100} className="h-1 bg-muted/20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Retrieval Matrix Sector — Actual Sources */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5 group/label">
                        <Database className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Retrieval Manifest</span>
                    </div>
                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest tabular-nums">
                        {results.sources?.length || 0} Vectors Resolved
                    </span>
                </div>

                <ScrollArea className="h-[600px] rounded-[40px] border border-border/60 bg-background/40 backdrop-blur-xl shadow-inner">
                    <div className="p-8 space-y-6">
                        {results.sources?.map((source: SearchSource, idx: number) => (
                            <div key={idx} className="group relative p-6 rounded-[28px] border border-primary/5 bg-background/60 hover:border-primary/20 transition-all duration-500 hover:shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black bg-primary/10 text-primary w-6 h-6 rounded-lg flex items-center justify-center tabular-nums">
                                            {idx + 1}
                                        </span>
                                        <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 text-primary/60 bg-primary/5 px-2 uppercase tracking-widest">
                                            {(source.score * 100).toFixed(1)}% Match
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                                        <FileText className="h-3 w-3" />
                                        {source.fileName || 'Unknown Node'}
                                    </div>
                                </div>
                                <p className="text-[12px] text-foreground/80 font-serif italic leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-700">
                                    "{source.text.trim()}"
                                </p>
                                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Spectral Vector {source.type}</span>
                                    <ChevronRight className="h-2.5 w-2.5 text-primary" />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="rounded-3xl border-destructive/20 bg-destructive/5 relative z-10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Spectral Inversion Failure</AlertTitle>
          <AlertDescription className="text-[11px] italic font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stable Version Footer */}
      <footer className="px-1 py-12 flex items-center justify-between opacity-40 relative z-10">
          <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                  Arkan Audit Core • Stable Build 2.4
              </p>
          </div>
          <span className="text-[9px] font-bold tabular-nums uppercase tracking-widest">AUDIT_VECTOR_ENCRYPTED</span>
      </footer>
    </div>
  );
}
