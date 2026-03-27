'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Zap,
    Cpu,
    Database,
    Network,
    Loader2
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/infrastructure/api/ApiService';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'error' | 'ready';
  details?: string | Record<string, unknown>;
  latency?: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  config: {
    provider: string;
    embeddingModel: string;
    vectorDimension: number;
  };
  checks: {
    ollama: HealthCheck;
    qdrant: HealthCheck;
    embeddings: HealthCheck;
  };
  error?: string;
}

const checkLabels: Record<keyof HealthStatus['checks'], string> = {
  ollama: 'Ollama Engine',
  qdrant: 'Vector Database',
  embeddings: 'Embedding Pipeline',
};

const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'healthy':
    case 'ready':
      return <ShieldCheck className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <ShieldAlert className="h-5 w-5 text-destructive" />;
    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  switch (status) {
    case 'healthy':
    case 'ready':
      return 'secondary';
    case 'error':
      return 'destructive';
    case 'degraded':
      return 'outline';
    default:
      return 'outline';
  }
};

export function RAGHealthMonitor(): React.JSX.Element {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService<undefined, HealthStatus>({ endpoint: '/api/rag/health' });
      setHealth(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RAG health status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        void fetchHealth();
      }, 30000); // 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchHealth, autoRefresh]);

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Health Matrix Manifest
            </h3>
        </div>
        <div className="flex items-center gap-4">
            {health && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
                    Sync: {new Date(health.timestamp).toLocaleTimeString()}
                </span>
            )}
            <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="ghost"
                size="sm"
                className={cn(
                    "h-8 px-3 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all",
                    autoRefresh ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/5"
                )}
            >
                Auto {autoRefresh ? "Enabled" : "Disabled"}
            </Button>
            <Button
                onClick={() => void fetchHealth()}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5"
            >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                Force Pulse
            </Button>
        </div>
      </header>

      <CardContent className="p-8 md:p-10 space-y-10">
        {error && (
          <Alert variant="destructive" className="mb-10 bg-destructive/[0.03] border-destructive/20 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium italic">
              Matrix Sync Error: {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && !health ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Health Matrix</p>
            </div>
        ) : health ? (
          <div className="space-y-10">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {/* System Status Node */}
                <div className={cn(
                    "group relative flex flex-col p-6 rounded-3xl border transition-all duration-500 shadow-sm",
                    health.status === 'healthy' ? "bg-background border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5" : "bg-destructive/[0.02] border-destructive/20"
                )}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={cn(
                            "h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner",
                            health.status !== 'healthy' && "bg-destructive/10 text-destructive"
                        )}>
                            {getStatusIcon(health.status)}
                        </div>
                        <Badge variant={getStatusBadgeVariant(health.status)} className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                            System {health.status}
                        </Badge>
                    </div>
                    <h4 className="text-sm font-bold tracking-tight">Deployment Health</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Core Stack Status</p>
                </div>

                {/* Config Nodes */}
                <div className="group relative flex flex-col p-6 rounded-3xl border border-border/60 bg-muted/5 transition-all duration-500 xl:col-span-3">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                                <Database className="h-2.5 w-2.5" /> Provider
                            </span>
                            <p className="text-xs font-bold truncate">{health.config.provider}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                                <Cpu className="h-2.5 w-2.5" /> Model
                            </span>
                            <p className="text-xs font-bold truncate">{health.config.embeddingModel}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                                <Network className="h-2.5 w-2.5" /> Dimension
                            </span>
                            <p className="text-xs font-bold truncate">{health.config.vectorDimension} Dimensions</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-border/40" />

            <div className="grid gap-6 md:grid-cols-3">
              {Object.entries(health.checks).map(([key, check]) => {
                const isCheckHealthy = check.status === 'healthy' || check.status === 'ready';
                const label = checkLabels[key as keyof HealthStatus['checks']];

                return (
                    <div key={key} className={cn(
                        "group relative flex flex-col p-6 rounded-3xl border transition-all duration-500 shadow-sm",
                        isCheckHealthy ? "bg-background border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5" : "bg-destructive/[0.02] border-destructive/20"
                    )}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner",
                                isCheckHealthy ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                            )}>
                                {getStatusIcon(check.status)}
                            </div>
                            <Badge variant={getStatusBadgeVariant(check.status)} className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                                {check.status}
                            </Badge>
                        </div>
                        <h4 className="text-sm font-bold tracking-tight">{label}</h4>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed mt-2 line-clamp-2">
                            {typeof check.details === 'string' ? check.details : 'Component responded successfully to health query.'}
                        </p>

                        {check.latency !== undefined && (
                            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-6">
                                <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/40">Latency</span>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                                    <Zap className="h-3 w-3 fill-primary/20" />
                                    {check.latency}ms
                                </div>
                            </div>
                        )}
                    </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan Oversight Engine • Status Node V1.0
          </p>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                  Global System Pulse: Operational
              </Badge>
          </div>
      </footer>
    </Card>
  );
}
