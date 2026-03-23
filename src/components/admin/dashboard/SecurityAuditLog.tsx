'use client';

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/di/container";
import { AdminApiClient } from "@/modules/admin/adapters/api-client/AdminApiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, History, UserCheck, Lock, LogOut, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function SecurityAuditLog() {
    const { data: logs, isLoading } = useQuery({
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
            case 'lockdown': return <Lock className="h-4 w-4 text-destructive" />;
            case 'restore': return <UserCheck className="h-4 w-4 text-green-600" />;
            case 'session_revocation': return <LogOut className="h-4 w-4 text-orange-500" />;
            case 'password_change': return <Key className="h-4 w-4 text-blue-500" />;
            default: return <History className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getActionLabel = (action: string) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Security Audit Log
                </CardTitle>
                <CardDescription>History of critical administrative and account security actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Admin ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="text-xs font-medium whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getActionIcon(log.action)}
                                        <span className="text-xs font-semibold">{getActionLabel(log.action)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium">{log.userName || log.userId}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{log.details}</TableCell>
                                <TableCell className="text-[10px] font-mono">{log.adminId || 'System'}</TableCell>
                            </TableRow>
                        ))}
                        {logs?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8 italic">
                                    No security events recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
