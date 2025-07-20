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

export function AgentUsageChart({ data }: AgentUsageChartProps) {
    const { resolvedTheme } = useTheme();
    const { t } = useLocalization();
    const fillColor = resolvedTheme === 'dark' ? '#8884d8' : '#2563eb';

    return (
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>{t('adminDashboard.agentUsageTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            angle={-30}
                            textAnchor="end"
                            height={70}
                            interval={0}
                        />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--muted))' }}
                            contentStyle={{
                                background: 'hsla(var(--background))',
                                border: '1px solid hsla(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Bar dataKey="count" fill={fillColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
