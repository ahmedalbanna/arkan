
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AgentUsageData {
    name: string;
    count: number;
}

interface AgentUsageChartProps {
    data: AgentUsageData[];
}

export function AgentUsageChart({ data }: AgentUsageChartProps) {
    const { resolvedTheme } = useTheme();
    const { t } = useLocalization();
    const fillColor = resolvedTheme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))';

    return (
        <Card variant="glass" className="lg:col-span-4 backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-headline">{t('adminDashboard.agentUsageTitle')}</CardTitle>
                            <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" />
                                Usage Analytics
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                angle={-30}
                                textAnchor="end"
                                height={70}
                                interval={0}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                            />
                            <Bar dataKey="count" fill={fillColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </AnimatedContainer>
            </Card>

    );
}
