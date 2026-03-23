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

export function UserRetentionReport({ stats }: UserRetentionReportProps) {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeUsersLast30Days}</div>
                        <p className="text-xs text-muted-foreground">Unique users with activity in the last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Daily Generation Activity
                        </CardTitle>
                        <CardDescription>Number of AI generations per day (last 30 days)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer config={{
                            count: {
                                label: "Generations",
                                color: "hsl(var(--primary))",
                            },
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyGenerationTrend}>
                                    <defs>
                                        <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis 
                                        dataKey="date" 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickMargin={8} 
                                        minTickGap={32}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="var(--color-count)" 
                                        fill="url(#fillCount)" 
                                        fillOpacity={0.4} 
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Top Credit Spenders
                        </CardTitle>
                        <CardDescription>Users with highest AI utilization</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Credits</TableHead>
                                    <TableHead className="text-right">Gens</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.topSpenders.map((spender, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{spender.userName}</TableCell>
                                        <TableCell className="text-right text-primary font-bold">{spender.totalSpent}</TableCell>
                                        <TableCell className="text-right">{spender.generationCount}</TableCell>
                                    </TableRow>
                                ))}
                                {stats.topSpenders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No activity data yet</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
