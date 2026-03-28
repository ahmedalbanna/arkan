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

import { cn } from "@/infrastructure/utils/cn";
import { ShieldAlert } from "lucide-react";

export function MultiCountryAlert({ report }: MultiCountryAlertProps) {
    return (
        <Card className="border-none shadow-2xl shadow-orange-500/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="px-8 py-6 border-b bg-orange-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-600">
                        Geo-Strategic Threat Manifest
                    </h3>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-orange-500/20 text-orange-600 bg-orange-500/5">
                    Multi-Country Alert
                </Badge>
            </header>

            <CardContent className="p-8 md:p-10 space-y-8">
                <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold tracking-tight">Geographic Anomaly Detection</h4>
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        The following nodes have transmitted signals from multiple jurisdictional regions. Potential proxy or unauthorized node sharing identified.
                    </p>
                </div>

                <div className="rounded-2xl border border-orange-500/20 bg-background overflow-hidden shadow-sm shadow-orange-500/5">
                    <Table>
                        <TableHeader className="bg-orange-500/[0.03]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Identified Subject</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Regional Topology</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-center">Transmission Count</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-right">Intervention</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {report.map((user) => (
                                <TableRow key={user.userId} className="group hover:bg-orange-500/[0.02] transition-colors border-orange-500/10">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500/40 group-hover:bg-orange-500 transition-colors" />
                                            <span className="text-xs font-bold tracking-tight">{user.userName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.countries.map((country, idx) => (
                                                <Badge key={idx} variant="secondary" className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none bg-orange-500/10 text-orange-700">
                                                    {country.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <span className="text-xs font-black tabular-nums text-foreground/80">
                                            {user.loginCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <Badge variant="outline" className="h-5 text-[9px] font-bold tracking-widest uppercase border-orange-500/40 text-orange-600 bg-orange-500/[0.03]">
                                            Under Review
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    Arkan Sentinel Engine • Geo Node V1.0
                </p>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-orange-500/40" />
                    <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                        Geographic Policy Audit Active
                    </span>
                </div>
            </footer>
        </Card>
    );
}
