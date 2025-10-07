
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

// Dynamic import for recharts to reduce bundle size
const RechartsChart = dynamic(() => import('./RechartsChartComponent'), {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
});

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

    return (
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>{t('adminDashboard.agentUsageTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <RechartsChart data={data} theme={resolvedTheme} />
            </CardContent>
        </Card>
    );
}
