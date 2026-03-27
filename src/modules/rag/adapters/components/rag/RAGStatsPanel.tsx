'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Database, FileText, RefreshCw, TrendingUp, Zap } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/infrastructure/api/ApiService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

interface RAGStats {
  totalChunks: number;
  projects: { projectId: string; count: number }[];
  averageChunkSize: number;
  recentActivity: {
    indexing: number;
    retrieval: number;
    avgSearchTime: number;
  };
}

export function RAGStatsPanel(): React.JSX.Element {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService<undefined, RAGStats>({ endpoint: '/api/rag/stats' });
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RAG stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin" />
            Loading statistics...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load RAG stats: {error}</AlertDescription>
        <Button onClick={() => void fetchStats()} variant="outline" size="sm" className="mt-2 w-fit">
          Retry
        </Button>
      </Alert>
    );
  }

  const safeStats = stats ?? {
    totalChunks: 0,
    projects: [],
    averageChunkSize: 0,
    recentActivity: { indexing: 0, retrieval: 0, avgSearchTime: 0 },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Node: Total Chunks */}
        <div className="group relative flex flex-col p-6 rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <Database className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="h-4 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                    Inventory
                </Badge>
            </div>
            <div className="text-3xl font-bold tracking-tight">{safeStats.totalChunks.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Total Vector Chunks</p>
        </div>

        {/* Metric Node: Active Projects */}
        <div className="group relative flex flex-col p-6 rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <FileText className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="h-4 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                    Scoping
                </Badge>
            </div>
            <div className="text-3xl font-bold tracking-tight">{safeStats.projects.length}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Active Data Projects</p>
        </div>

        {/* Metric Node: Search Latency */}
        <div className="group relative flex flex-col p-6 rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <Zap className="h-5 w-5 fill-primary/20" />
                </div>
                <Badge variant="secondary" className="h-4 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                    Performance
                </Badge>
            </div>
            <div className="text-3xl font-bold tracking-tight">{safeStats.recentActivity.avgSearchTime}ms</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Avg Retrieval Speed</p>
        </div>

        {/* Metric Node: Recent Op Density */}
        <div className="group relative flex flex-col p-6 rounded-3xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="h-4 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                    Throughput
                </Badge>
            </div>
            <div className="text-3xl font-bold tracking-tight">
                {safeStats.recentActivity.indexing + safeStats.recentActivity.retrieval}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Operations (24h)</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    Project Distribution Manifest
                </h3>
            </div>
            <Button
                onClick={() => void fetchStats()}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5"
            >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                Refresh Assets
            </Button>
        </header>

        <CardContent className="p-8 md:p-10">
          {safeStats.projects.length > 0 ? (
            <div className="grid gap-8">
              {safeStats.projects.map((project) => {
                const percentage = safeStats.totalChunks > 0
                  ? (project.count / safeStats.totalChunks) * 100
                  : 0;

                return (
                  <div key={project.projectId} className="space-y-3">
                    <div className="flex items-end justify-between px-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Project Registry</span>
                            <span className="text-xs font-bold">{project.projectId}</span>
                        </div>
                        <Badge variant="outline" className="h-5 text-[10px] font-bold tracking-tighter border-border/60">
                            {project.count.toLocaleString()} Chunks ({percentage.toFixed(1)}%)
                        </Badge>
                    </div>
                    <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center opacity-40">
                <Database className="h-10 w-10 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No Project Distribution Data</p>
            </div>
          )}
        </CardContent>

        <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                Arkan Distribution Engine • Assets Node V1.0
            </p>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                    Distribution Synchronized
                </Badge>
            </div>
        </footer>
      </Card>
    </div>
  );
}
