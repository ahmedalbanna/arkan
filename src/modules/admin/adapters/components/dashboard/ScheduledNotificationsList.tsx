'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/infrastructure/api/ApiService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import { XCircle, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/util/use-toast';

import { cn } from "@/infrastructure/utils/cn";
import { ScrollArea } from '@/components/ui/scroll-area';

export function ScheduledNotificationsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin', 'scheduled-notifications'],
    queryFn: () => apiService<undefined, any[]>({
        endpoint: '/api/admin/notifications/scheduled'
    }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiService({
        endpoint: `/api/admin/notifications/scheduled?id=${id}`,
        method: 'DELETE'
    }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'scheduled-notifications'] });
        toast({ title: "Cancelled", description: "Scheduled notification has been cancelled." });
    },
    onError: (error: any) => {
        toast({ title: "Error", description: error.message || "Failed to cancel", variant: 'destructive' });
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Queue</p>
    </div>
  );

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Transmission Queue
            </h3>
        </div>
        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            {notifications?.length || 0} Pending Tasks
        </Badge>
      </header>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
            <Table>
                <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-8">Announcement Identity</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Dispatch Node</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Current Protocol</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-8 text-right">Intervention</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(notifications || []).map((n) => (
                    <TableRow key={n.id} className="group hover:bg-muted/5 transition-colors border-border/40">
                        <TableCell className="px-8 py-4">
                            <div className="space-y-1">
                                <div className="text-xs font-bold tracking-tight">{n.title}</div>
                                <div className="text-[10px] text-muted-foreground italic truncate max-w-[180px]">{n.description}</div>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">{format(new Date(n.scheduledFor), 'MMM d, HH:mm')}</div>
                                <div className="text-[9px] font-bold text-primary/60 uppercase tracking-tighter">
                                    {new Date(n.scheduledFor) > new Date()
                                        ? `Initialize in ${formatDistanceToNow(new Date(n.scheduledFor))}`
                                        : `Past Synchronization`}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <StatusBadge status={n.status} />
                        </TableCell>
                        <TableCell className="px-8 py-4 text-right">
                        {n.status === 'pending' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                onClick={() => cancelMutation.mutate(n.id)}
                                disabled={cancelMutation.isPending}
                            >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Abort
                            </Button>
                        )}
                        </TableCell>
                    </TableRow>
                    ))}
                    {(!notifications || notifications.length === 0) && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center opacity-40">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center">
                                    <Clock className="h-8 w-8 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Queue Empty</h3>
                                    <p className="text-[10px] italic leading-relaxed max-w-[200px] mx-auto">No high-priority transmissions scheduled in the network.</p>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5">
          <p className="text-[8px] text-center text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
              Arkan Scheduler Engine • Node V1.0 Stable
          </p>
      </footer>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'pending':
            return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Pending</span>
                </div>
            );
        case 'sent':
            return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Dispatched</span>
                </div>
            );
        case 'failed':
            return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Failure</span>
                </div>
            );
        case 'cancelled':
            return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground border border-border/40">
                    <XCircle className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Aborted</span>
                </div>
            );
        default:
            return <Badge variant="outline" className="text-[9px] uppercase font-bold">{status}</Badge>;
    }
}
