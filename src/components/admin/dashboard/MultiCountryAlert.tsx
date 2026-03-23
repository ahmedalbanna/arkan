'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MultiCountryAlertProps {
    report: {
        userId: string;
        userName: string;
        countries: string[];
        loginCount: number;
    }[];
}

export function MultiCountryAlert({ report }: MultiCountryAlertProps) {
    return (
        <Card className="border-orange-500/50 bg-orange-50/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-full bg-orange-100 p-2">
                    <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <CardTitle className="text-orange-700">Multi-Country Login Detection</CardTitle>
                    <CardDescription>Accounts with activity across different countries. May indicate VPN or sharing.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Detected Countries</TableHead>
                            <TableHead className="text-center">Total Logins</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell className="font-medium">{user.userName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {user.countries.map((country, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-[10px]">
                                                {country.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-semibold">
                                    {user.loginCount}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-100/50">
                                        REVIEW
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
