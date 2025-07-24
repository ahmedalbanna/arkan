
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/query-keys';
import { fetchDashboardStats, type DashboardStats } from '@/services/admin-service';
import { AlertCircle, Bot, CreditCard, Users } from 'lucide-react';
import { StatCard } from './StatCard';
import { AgentUsageChart } from './AgentUsageChart';
import { RecentActivity } from './RecentActivity';
import { Skeleton } from '../ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardHeader, CardContent } from '../ui/card';

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/4" />
                <Skeleton className="h-4 w-4 rounded-sm" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/4" />
            </CardContent>
        </Card>
    );
}

function RecentActivitySkeleton() {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="grid gap-1 flex-grow">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-3 w-3/5" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                     <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                     <CardContent className="pl-2">
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <RecentActivitySkeleton />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { firebaseUser } = useAuth();
    const { t } = useLocalization();

    const { data, isLoading, isError, error } = useQuery<DashboardStats>({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchDashboardStats(token);
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-destructive border rounded-lg">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('adminDashboard.errorLoading')}: {error.message}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title={t('adminDashboard.totalUsers')} value={data?.totalUsers.toString()} icon={Users} />
                <StatCard title={t('adminDashboard.totalGenerations')} value={data?.totalGenerations.toString()} icon={Bot} />
                <StatCard title={t('adminDashboard.pendingPayments')} value={data?.pendingPayments.toString()} icon={CreditCard} />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <AgentUsageChart data={data?.agentUsageChartData || []} />
                <RecentActivity data={data?.recentActivity || []} />
            </div>
        </div>
    );
}
