'use client';

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/di/container";
import { AdminApiClient } from "@/modules/admin/adapters/api-client/AdminApiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, History, UserCheck, Lock, LogOut, Key, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/infrastructure/utils/cn";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SecurityAuditLog() {
    const { data: logs, isLoading, isFetching } = useQuery({
        queryKey: ['security-audit-logs'],
        queryFn: async () => {
            const client = container.resolve(AdminApiClient);
            const result = await client.fetchSecurityAuditLogs();
            if (result.isFailure) throw result.error;
            return result.getValue();
        }
    });

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'lockdown': return <Lock className="h-3.5 w-3.5 text-destructive" />;
            case 'restore': return <UserCheck className="h-3.5 w-3.5 text-green-600" />;
            case 'session_revocation': return <LogOut className="h-3.5 w-3.5 text-orange-500" />;
            case 'password_change': return <Key className="h-3.5 w-3.5 text-blue-500" />;
            default: return <History className="h-3.5 w-3.5 text-muted-foreground" />;
        }
    };

    const getActionLabel = (action: string) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Audit Trail</p>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        Security Audit Manifest
                    </h3>
                    {isFetching && <Loader2 className="h-3 w-3 animate-spin text-primary/40" />}
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                    Immutable Log Node
                </Badge>
            </header>

            <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-8">Transmission Time</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Administrative Action</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Subject Identity</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Protocol Details</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-8 text-right">Executor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log) => (
                                <TableRow key={log.id} className="group hover:bg-muted/5 transition-colors border-border/40">
                                    <TableCell className="px-8 py-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                {getActionIcon(log.action)}
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/80">
                                                {getActionLabel(log.action)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold tracking-tight">{log.userName || 'Anonymous Node'}</span>
                                            <span className="text-[9px] font-mono text-muted-foreground/60">{log.userId.slice(0, 8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 max-w-[300px]">
                                        <p className="text-[11px] text-muted-foreground italic leading-relaxed truncate group-hover:text-foreground transition-colors" title={log.details}>
                                            {log.details}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-8 py-4 text-right">
                                        <Badge variant="secondary" className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none bg-primary/5 text-primary">
                                            {log.adminId ? `ADMIN: ${log.adminId.slice(0, 6)}` : 'SYSTEM_NODE'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center opacity-40">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center">
                                                <ShieldCheck className="h-8 w-8 text-primary/60" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audit Trail Empty</h3>
                                                <p className="text-[10px] italic leading-relaxed max-w-[200px] mx-auto">No critical security events identified in the current session.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>

            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    Arkan Sentinel Engine • Audit Node V1.0 Stable
                </p>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                        Log Integrity Verified
                    </span>
                </div>
            </footer>
        </Card>
    );
}
