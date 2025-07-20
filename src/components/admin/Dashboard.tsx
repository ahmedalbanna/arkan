'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/query-keys';
import { fetchDashboardStats, type DashboardStats } from '@/services/admin-service';
import { AlertCircle, Bot, CreditCard, Loader2, Users } from 'lucide-react';
import { StatCard } from './StatCard';
import { AgentUsageChart } from './AgentUsageChart';
import { RecentActivity } from './RecentActivity';
import { Skeleton } from '../ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                     <Skeleton className="h-80" />
                </div>
                <div className="lg:col-span-3">
                     <Skeleton className="h-80" />
                </div>
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
