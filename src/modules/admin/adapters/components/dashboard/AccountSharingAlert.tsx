'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ShieldAlert, Lock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/di/container";
import { AdminApiClient } from "@/modules/admin/adapters/api-client/AdminApiClient";
import { toast } from "@/hooks";

interface AccountSharingAlertProps {
    report: {
        userId: string;
        userName: string;
        deviceCount: number;
        lastLogin: string;
    }[];
}

import { cn } from "@/infrastructure/utils/cn";
import { formatDistanceToNow } from "date-fns";

export function AccountSharingAlert({ report }: AccountSharingAlertProps) {
    const queryClient = useQueryClient();

    const lockdownMutation = useMutation({
        mutationFn: async (userId: string) => {
            const client = container.resolve(AdminApiClient);
            const result = await client.setUserDisabledStatus(userId, true);
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        onSuccess: () => {
            toast({ title: 'Account Locked', description: 'The user has been disabled and all sessions revoked.' });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (error: any) => {
            toast({ title: 'Lockdown Failed', description: error.message, variant: 'destructive' });
        }
    });

    return (
        <Card className="border-none shadow-2xl shadow-destructive/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="px-8 py-6 border-b bg-destructive/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-destructive">
                        Security Threat Manifest
                    </h3>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-destructive/20 text-destructive bg-destructive/5">
                    Account Sharing Detected
                </Badge>
            </header>

            <CardContent className="p-8 md:p-10 space-y-8">
                <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold tracking-tight">Abnormal Device Proliferation</h4>
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        The following accounts have exceeded the standard unique device threshold. Initialize isolation protocols if necessary.
                    </p>
                </div>

                <div className="rounded-2xl border border-destructive/20 bg-background overflow-hidden shadow-sm shadow-destructive/5">
                    <Table>
                        <TableHeader className="bg-destructive/[0.03]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Identified Subject</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-center">Node Count</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Last Transmission</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-right">Intervention</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {report.map((user) => {
                                const isCritical = user.deviceCount > 10;
                                return (
                                    <TableRow key={user.userId} className="group hover:bg-destructive/[0.02] transition-colors border-destructive/10">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-1.5 w-1.5 rounded-full", isCritical ? "bg-destructive animate-pulse" : "bg-destructive/40")} />
                                                <span className="text-xs font-bold tracking-tight">{user.userName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className={cn("text-base font-black tabular-nums", isCritical ? "text-destructive" : "text-foreground")}>
                                                {user.deviceCount}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Badge variant={isCritical ? "destructive" : "outline"} className={cn("h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none", !isCritical && "bg-destructive/10 text-destructive")}>
                                                    {isCritical ? "Critical" : "High Risk"}
                                                </Badge>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-destructive/20 active:scale-95 transition-all"
                                                    onClick={() => lockdownMutation.mutate(user.userId)}
                                                    disabled={lockdownMutation.isPending}
                                                >
                                                    {lockdownMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                                                    Isolate
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    Arkan Sentinel Engine • Threat Node V1.0
                </p>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive/40" />
                    <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                        Policy Violation Identified
                    </span>
                </div>
            </footer>
        </Card>
    );
}
