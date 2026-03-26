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
        <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-full bg-destructive/10 p-2">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                </div>
                <div>
                    <CardTitle className="text-destructive">Potential Account Sharing Detected</CardTitle>
                    <CardDescription>Users with an unusually high number of unique devices detected.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="text-center">Unique Devices</TableHead>
                            <TableHead>Last Seen</TableHead>
                            <TableHead className="text-right">Risk Level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell className="font-medium">{user.userName}</TableCell>
                                <TableCell className="text-center">
                                    <span className="text-lg font-bold">{user.deviceCount}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(user.lastLogin).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                    <Badge variant={user.deviceCount > 10 ? "destructive" : "outline"} className={user.deviceCount > 10 ? "" : "border-destructive text-destructive"}>
                                        {user.deviceCount > 10 ? "CRITICAL" : "HIGH"}
                                    </Badge>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => lockdownMutation.mutate(user.userId)}
                                        disabled={lockdownMutation.isPending}
                                    >
                                        {lockdownMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                                        Lockdown
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
