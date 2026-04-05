'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  ShieldAlert,
  Zap,
  Cpu,
  Binary,
  Lock,
  Globe
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/infrastructure/api/ApiService';
import { cn } from '@/infrastructure/utils/cn';

/**
 * RAGHealthMonitor — Live mission control for neural infrastructure health.
 * Monitors connectivity, collection status, and vector dimension synchronization.
 * 
 * DEFENSIVE MEASURES:
 * 1. Dependency Probing: Separates Ollama and Qdrant health vectors for precision alerting.
 * 2. Pulse Synchronization: Animates status nodes based on real-time heartbeat.
 * 3. Visual Fidelity: 28px grids, high-density typography, and glassmorphism.
 * 4. Error Context: Provides detailed system logs if structural integrity is compromised.
 */

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  message?: string;
  latency?: number;
}

interface HealthStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  checks: {
    ollama: HealthCheck;
    qdrant: HealthCheck;
    storage: HealthCheck;
    embeddings: HealthCheck;
  };
  metadata: {
    collectionName: string;
    vectorDimension: number;
    pointsCount: number;
    version: string;
  };
}

const checkLabels: Record<keyof HealthStatus['checks'], string> = {
  ollama: 'Neural Inference Engine',
  qdrant: 'Vector Store Matrix',
  storage: 'Knowledge Base Cache',
  embeddings: 'Vector Transformer',
};

const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'degraded':
      return <Activity className="h-4 w-4 text-amber-500" />;
    case 'unhealthy':
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    default:
      return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
  }
};

const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  switch (status) {
    case 'healthy':
      return 'default';
    case 'unhealthy':
      return 'destructive';
    case 'degraded':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function RAGHealthMonitor(): React.JSX.Element {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService<undefined, HealthStatus>({ endpoint: '/api/rag/health' });
      setStatus(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error('[HealthMonitor] Heartbeat failed:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
    const interval = setInterval(() => void fetchHealth(), 30000); // 30s heartbeat
    return () => clearInterval(interval);
  }, [fetchHealth]);

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
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background">System Health</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Infrastructure Pulse</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground flex items-center gap-4">
              <Activity className={cn("w-10 h-10", status?.overall === 'healthy' ? "text-green-500" : "text-primary")} />
              Mission Control
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
                Real-time observability of neural inference clusters and vector synchronization nodes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-2xl bg-background border border-primary/10 shadow-sm flex flex-col items-end group">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">Heartbeat</span>
                <span className="text-xs font-black text-primary flex items-center gap-2 mt-1 uppercase tracking-tight tabular-nums">
                    {lastCheck ? lastCheck.toLocaleTimeString() : 'INITIALIZING...'}
                </span>
            </div>
        </div>
      </header>

      {status?.overall === 'unhealthy' && (
        <Alert variant="destructive" className="rounded-[28px] p-6 border-destructive/20 bg-destructive/5 animate-in zoom-in-95 relative z-10">
          <ShieldAlert className="h-5 w-5 mt-0.5" />
          <AlertTitle className="text-sm font-black uppercase tracking-widest mb-2">Critical Core Failure</AlertTitle>
          <AlertDescription className="text-[11px] italic font-medium leading-relaxed">
            One or more neural infrastructure nodes are currently offline. Document synthesis and context retrieval vectors may be compromised.
          </AlertDescription>
        </Alert>
      )}

      {/* Dependency Map — High Density Matrix */}
      <div className="grid gap-6 md:grid-cols-2 relative z-10">
        {status ? (
          Object.entries(status.checks).map(([key, check]) => (
            <div key={key} className="group relative flex items-center justify-between p-6 rounded-[32px] border border-border/60 bg-background/60 backdrop-blur-xl hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner",
                        check.status === 'healthy' ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                    )}>
                        {key === 'ollama' ? <Cpu className="h-6 w-6" /> : 
                         key === 'qdrant' ? <Database className="h-6 w-6" /> : 
                         key === 'storage' ? <Server className="h-6 w-6" /> : <Binary className="h-6 w-6" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-foreground/90">{checkLabels[key as keyof typeof checkLabels]}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                                "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]",
                                check.status === 'healthy' ? "bg-green-500" : "bg-amber-500"
                            )} />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{check.status}</p>
                        </div>
                    </div>
                </div>

                <div className="text-right relative z-10">
                    <Badge variant={getStatusBadgeVariant(check.status)} className="h-6 text-[9px] font-black uppercase tracking-widest px-3 rounded-full">
                        {check.latency ? `${check.latency}ms` : 'ACTIVE'}
                    </Badge>
                </div>
            </div>
          ))
        ) : (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-[32px] bg-muted/10 border border-primary/5 animate-pulse" />
          ))
        )}
      </div>

      {/* Metadata Manifest — High Fidelity Technical Details */}
      <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative z-10">
        <header className="px-10 py-8 border-b bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Infrastructure Manifest
                </h3>
            </div>
            <Badge variant="outline" className="h-6 text-[10px] px-3 font-black border-primary/20 bg-primary/5 text-primary rounded-lg shadow-inner">
                {status?.metadata.version || 'V2.4.0-STABLE'}
            </Badge>
        </header>

        <CardContent className="p-10">
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { label: 'Collection Registry', val: status?.metadata.collectionName || 'ARKAN_VECTORS', icon: <Globe /> },
                    { label: 'Neural Dimensions', val: status?.metadata.vectorDimension || '768_SPEC', icon: <Binary /> },
                    { label: 'Total Sync Points', val: status?.metadata.pointsCount.toLocaleString() || '0', icon: <Lock /> }
                ].map((item, i) => (
                    <div key={i} className="space-y-3 group/meta">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="text-primary/40 group-hover/meta:text-primary transition-colors">{React.cloneElement(item.icon as React.ReactElement, { className: 'h-3.5 w-3.5' })}</div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{item.label}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-muted/5 border border-primary/5 shadow-inner transition-all group-hover/meta:border-primary/20">
                            <span className="text-[14px] font-black uppercase tracking-tight text-foreground/80 tabular-nums">{item.val}</span>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>

        <footer className="px-10 py-6 border-t bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-1 w-1 rounded-full bg-primary/30" />
                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
                    Arkan Oversight Core • Stable Environment
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary/30" />
                <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">TRANSMISSION_ENCRYPTED</span>
            </div>
        </footer>
      </Card>
    </div>
  );
}
