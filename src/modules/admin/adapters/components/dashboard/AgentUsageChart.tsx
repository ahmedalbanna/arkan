
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useLocalization } from '@/context/LocalizationContext';

interface AgentUsageData {
    name: string;
    count: number;
}

interface AgentUsageChartProps {
    data: AgentUsageData[];
}

import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, Bot } from 'lucide-react';

export function AgentUsageChart({ data }: AgentUsageChartProps) {
    const { resolvedTheme } = useTheme();
    const { t } = useLocalization();
    const fillColor = 'hsl(var(--primary))';

    return (
        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] lg:col-span-4 animate-in fade-in duration-700">
            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        {t('adminDashboard.agentUsageTitle')}
                    </h3>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                    Neural Analytics
                </Badge>
            </header>

            <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-2 mb-8 px-1">
                    <Bot className="h-4 w-4 text-primary/60" />
                    <h4 className="text-sm font-semibold tracking-tight">Node Load Distribution</h4>
                </div>

                <div className="h-[300px] w-full bg-muted/5 rounded-2xl p-6 border border-dashed border-border/60 shadow-inner relative group">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeOpacity={0.5} />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={9}
                                fontWeight={700}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.toUpperCase()}
                                height={40}
                                dy={10}
                            />
                            <YAxis 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={9} 
                                fontWeight={700}
                                tickLine={false} 
                                axisLine={false} 
                                dx={-10}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 8 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background/80 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl shadow-primary/10 ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1.5">{payload[0].payload.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    <p className="text-xs font-bold tabular-nums">
                                                        {payload[0].value} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter ml-1">Executions</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar 
                                dataKey="count" 
                                fill={fillColor} 
                                radius={[6, 6, 0, 0]} 
                                barSize={32}
                                className="transition-all duration-500 hover:opacity-80"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>

            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    Arkan Intelligence Engine • Metric Node V1.0
                </p>
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-primary/40" />
                    <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                        Telemetry Synchronized
                    </span>
                </div>
            </footer>
        </Card>
    );
}
