'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Trophy } from "lucide-react";

interface UserRetentionReportProps {
    stats: {
        activeUsersLast30Days: number;
        topSpenders: {
            userName: string;
            totalSpent: number;
            generationCount: number;
        }[];
        dailyGenerationTrend: {
            date: string;
            count: number;
        }[];
    };
}

import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserRetentionReport({ stats }: UserRetentionReportProps) {
    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Top Metrics Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="group relative flex flex-col p-6 rounded-3xl border border-border/40 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-card overflow-hidden">
                    {/* Ghost Icon Backdrop */}
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-all duration-700 rotate-12">
                        <Users className="w-32 h-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                                <Users className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary" className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none bg-primary/5 text-primary">
                                System Node
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="text-3xl font-black tracking-tight tabular-nums transition-all duration-500 group-hover:text-primary">
                                {stats.activeUsersLast30Days}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                Monthly Active Nodes
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
                </Card>
            </div>

            <div className="grid gap-10 md:grid-cols-1 lg:grid-cols-7">
                {/* Generation Velocity Canvas */}
                <Card className="lg:col-span-4 border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
                    <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                Generation Velocity
                            </h3>
                        </div>
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                            30D Telemetry
                        </Badge>
                    </header>

                    <CardContent className="p-8 md:p-10">
                        <div className="h-[300px] w-full bg-muted/5 rounded-2xl p-6 border border-dashed border-border/60 shadow-inner relative group">
                            <ChartContainer config={{
                                count: {
                                    label: "Generations",
                                    color: "hsl(var(--primary))",
                                },
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.dailyGenerationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeOpacity={0.5} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={9}
                                            fontWeight={700}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={12}
                                            minTickGap={32}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                        />
                                        <YAxis hide />
                                        <ChartTooltip
                                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-background/80 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl shadow-primary/10 ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{new Date(payload[0].payload.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                                <p className="text-xs font-bold tabular-nums">
                                                                    {payload[0].value} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter ml-1">Daily Operations</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="var(--color-count)"
                                            fill="url(#fillCount)"
                                            strokeWidth={3}
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Leaderboard Manifest */}
                <Card className="lg:col-span-3 border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
                    <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                Utilization Manifest
                            </h3>
                        </div>
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                            Top Spenders
                        </Badge>
                    </header>

                    <CardContent className="p-0">
                        <ScrollArea className="h-[380px]">
                            <Table>
                                <TableHeader className="bg-muted/20">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-8">Identified Entity</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-right">Quota</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-8 text-right">Activity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.topSpenders.map((spender, i) => (
                                        <TableRow key={i} className="group hover:bg-muted/5 transition-colors border-border/40">
                                            <TableCell className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold bg-muted/50 text-muted-foreground w-5 h-5 rounded flex items-center justify-center border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-xs font-bold tracking-tight">{spender.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-primary tabular-nums tracking-tighter">-{spender.totalSpent}</span>
                                            </TableCell>
                                            <TableCell className="px-8 py-4 text-right">
                                                <Badge variant="secondary" className="h-4.5 text-[9px] font-bold tracking-tighter px-1.5 rounded-sm border-none bg-primary/5 text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {spender.generationCount} OPS
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.topSpenders.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-48 text-center opacity-40">
                                                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Activity Data</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>

                    <footer className="px-8 py-4 border-t bg-muted/5">
                        <p className="text-[8px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
                            Arkan Growth Engine • Analytics Node V1.0
                        </p>
                    </footer>
                </Card>
            </div>
        </div>
    );
}
