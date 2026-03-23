'use client';

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/di/container";
import { UserApiClient } from "@/modules/users/adapters/api-client/UserApiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoginHistoryListProps {
    userId: string;
}

export function LoginHistoryList({ userId }: LoginHistoryListProps) {
    const { data: history, isLoading } = useQuery({
        queryKey: ['login-history', userId],
        queryFn: async () => {
            const client = container.resolve(UserApiClient);
            const result = await client.fetchLoginHistory(userId);
            if (result.isFailure) throw result.error;
            return result.getValue();
        }
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Login History
                </CardTitle>
                <CardDescription>Review your recent account activity and login locations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead className="hidden md:table-cell">Device / Browser</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history?.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </div>
                                </TableCell>
                                <TableCell>{entry.ip}</TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                                    {entry.userAgent}
                                </TableCell>
                            </TableRow>
                        ))}
                        {history?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    No login history recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
