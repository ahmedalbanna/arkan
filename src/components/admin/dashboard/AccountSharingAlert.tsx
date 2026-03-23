'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AccountSharingAlertProps {
    report: {
        userId: string;
        userName: string;
        deviceCount: number;
        lastLogin: string;
    }[];
}

export function AccountSharingAlert({ report }: AccountSharingAlertProps) {
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
                                <TableCell className="text-right">
                                    <Badge variant={user.deviceCount > 10 ? "destructive" : "outline"} className={user.deviceCount > 10 ? "" : "border-destructive text-destructive"}>
                                        {user.deviceCount > 10 ? "CRITICAL" : "HIGH"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
