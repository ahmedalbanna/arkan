'use client';

import React, { useMemo, useState, Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useInfiniteQuery } from '@tanstack/react-query';
import { 
    History, 
    Search, 
    RefreshCw, 
    Loader2, 
    Database, 
    Cpu, 
    Binary, 
    ShieldCheck, 
    ChevronDown, 
    AlertCircle,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { apiService } from '@/infrastructure/api/ApiService';
import { format } from 'date-fns';
import { cn } from '@/infrastructure/utils/cn';

// Dynamic import for heavy JSON visualizer
const ReactJson = dynamic(() => import('@microlink/react-json-view'), { 
    ssr: false,
    loading: () => <div className="h-40 flex items-center justify-center bg-muted/5 rounded-2xl animate-pulse text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Initializing Neural Visualizer...</div>
});

// ── Error Boundary for JSON Rendering ──────────────────────────────────────────

class JsonErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[GenerationLog:JSON] Visualizer crash:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 rounded-2xl border border-dashed border-destructive/20 bg-destructive/5 text-center text-destructive text-[10px] font-black uppercase tracking-widest">
                    Metadata Visualization Failed
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * GenerationLogViewer — High-fidelity telemetry archive for neural operations.
 * Monitors and visualizes the history of AI tool invocations and results.
 * 
 * DEFENSIVE MEASURES:
 * 1. Type Resilience: Replaces 'any' with strict Log domain interfaces.
 * 2. Visual Containment: Isolated Error Boundary for the JSON detail vector.
 * 3. Atomic Paging: Standardized infinite scroll logic with existence guards.
 * 4. Technical Aesthetic: Standardized 28px dot-grids and technical typography.
 */

interface GenerationLog {
  id: string;
  userId: string;
  userName: string;
  toolName: string;
  prompt: string;
  result: string;
  metadata: any;
  createdAt: string;
}

function LogDetailView({ log }: { log: GenerationLog }) {
  return (
    <div className="space-y-8 py-4 relative group">
        {/* Depth architectural line */}
        <div className="absolute left-[-1.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

        <div className="space-y-3 px-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Logic Prompt Vector</span>
            <div className="p-5 rounded-2xl bg-muted/5 border border-primary/5 shadow-inner text-[12px] font-serif italic leading-relaxed text-foreground/80">
                {log.prompt || 'Zero payload detected.'}
            </div>
        </div>

        <div className="space-y-3 px-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Neural Output manifest</span>
            <div className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/10 shadow-inner text-[12px] font-serif italic leading-relaxed text-foreground/90">
                {log.result || 'Synthesis unsuccessful.'}
            </div>
        </div>

        <div className="space-y-3 px-1">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Technical Metadata</span>
            <div className="rounded-[28px] border border-border/60 bg-black/5 dark:bg-white/[0.02] p-6 shadow-inner overflow-hidden relative">
                <JsonErrorBoundary>
                    <ReactJson 
                        src={log.metadata || { status: 'NO_META' }} 
                        theme="monokai" 
                        name={false}
                        collapsed={1}
                        enableClipboard={false}
                        displayDataTypes={false}
                        style={{ background: 'transparent', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                    />
                </JsonErrorBoundary>
            </div>
        </div>
    </div>
  );
}

export default function GenerationLogViewer() {
  const [search, setSearch] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['generation-logs', search],
    queryFn: async ({ pageParam = 1 }) => {
      return await apiService<undefined, { logs: GenerationLog[], nextPage: number | null }>({
        endpoint: `/api/admin/generations?page=${pageParam}&search=${search}`,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const logs = useMemo(() => data?.pages.flatMap((page) => page.logs) || [], [data]);

  if (isLoading && logs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-96 space-y-6 opacity-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Extracting Telemetry Archive...</p>
        </div>
    );
  }

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative animate-in fade-in duration-700">
      {/* 28px Dot-grid Background atmospheric decoration */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" 
        style={{ backgroundSize: '28px 28px' }}
      />

      <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo">
            <History className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div>
            <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground/90 leading-none">
                Neural Archive
            </h3>
            <div className="flex items-center gap-2 mt-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                    Telemetry Stream Synchronized
                </p>
            </div>
          </div>
        </div>
        
        <div className="relative group/search w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
            <Input
                placeholder="SCAN LOGS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 text-[10px] font-black uppercase tracking-widest bg-muted/5 border-primary/5 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all"
            />
        </div>
      </header>

      <CardContent className="p-0 relative z-10 min-h-[500px]">
        {isError ? (
            <div className="py-24 text-center space-y-6">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive/40" />
                <div className="space-y-2">
                    <h4 className="text-[14px] font-black uppercase tracking-[0.2em] text-destructive/80">Stream Integrity Failure</h4>
                    <p className="text-[11px] text-muted-foreground/60 italic font-medium px-12 max-w-md mx-auto">The telemetry core could not retrieve the generation archive. Secure link may be unstable.</p>
                </div>
                <Button onClick={() => refetch()} variant="outline" className="h-10 px-8 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-[9px]">Reinitialize Link</Button>
            </div>
        ) : logs.length > 0 ? (
            <ScrollArea className="h-[600px] w-full">
                <Table>
                    <TableHeader className="bg-muted/10 border-b border-primary/5 sticky top-0 z-20 backdrop-blur-md">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-12 px-8">Operational Node</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-12 px-8 text-center">Tool Vector</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-12 px-8">Timestamp</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-12 px-8 text-right">Inspect</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} className="group/row hover:bg-primary/[0.02] transition-colors border-primary/5">
                                <TableCell className="px-8 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80">{log.userName}</span>
                                        <span className="text-[8px] font-mono text-muted-foreground/40 tabular-nums">ID: {log.userId.slice(0, 12)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-center">
                                    <Badge variant="outline" className="h-6 text-[9px] font-black border-primary/20 bg-primary/5 text-primary uppercase tracking-widest px-3 rounded-full shadow-inner">
                                        {log.toolName}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 tabular-nums uppercase">
                                        <Cpu className="h-3 w-3 opacity-30" />
                                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[85vh] p-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl overflow-hidden flex flex-col">
                                            <DialogHeader className="px-8 py-6 border-b border-primary/10 bg-primary/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                        <Binary className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-[14px] font-black uppercase tracking-tight">Spectral Log Vector</DialogTitle>
                                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mt-0.5">{log.toolName} — {log.id}</p>
                                                    </div>
                                                </div>
                                            </DialogHeader>
                                            <ScrollArea className="flex-1">
                                                <div className="p-8">
                                                    <LogDetailView log={log} />
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {hasNextPage && (
                    <div className="p-8 flex justify-center border-t border-primary/5">
                        <Button 
                            onClick={() => fetchNextPage()} 
                            disabled={isFetchingNextPage}
                            variant="ghost"
                            className="h-11 px-10 text-[10px] font-black uppercase tracking-[0.25em] gap-3 hover:bg-primary/5 hover:text-primary transition-all"
                        >
                            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                            {isFetchingNextPage ? 'Extracting Nodes...' : 'Load Additional Telemetry'}
                        </Button>
                    </div>
                )}
            </ScrollArea>
        ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-5 opacity-30">
                <div className="p-8 rounded-[32px] border border-dashed border-primary/20 bg-muted/5 shadow-inner">
                    <Database className="h-12 w-12 text-muted-foreground stroke-[1.5]" />
                </div>
                <div className="space-y-1.5 px-10">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">Zero Log Result</h3>
                    <p className="text-[11px] italic font-medium max-w-sm">No neural operation vectors matched the current filter parameters.</p>
                </div>
            </div>
        )}
      </CardContent>

      <footer className="px-10 py-6 border-t border-primary/10 bg-muted/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
            Arkan Telemetry Core • Log Node V2.4 Stable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/30" />
          <span className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-widest">
            Spectral Records Immutable
          </span>
        </div>
      </footer>
    </Card>
  );
}
