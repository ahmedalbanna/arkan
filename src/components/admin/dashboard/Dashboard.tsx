
'use client';

import { useAdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { AlertCircle, Bot, CreditCard, Users } from 'lucide-react';
import { StatCard } from './StatCard';
import { AgentUsageChart } from './AgentUsageChart';
import { RecentActivity } from './RecentActivity';
import { UserRetentionReport } from './UserRetentionReport';
import { AccountSharingAlert } from './AccountSharingAlert';
import { useLocalization } from '@/context/LocalizationContext';
import { DashboardSkeleton } from './skeletons';


export default function Dashboard() {
    const { t } = useLocalization();
    const { data, isLoading, isError, error } = useAdminDashboard();


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

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-7">
                <AgentUsageChart data={data?.agentUsageChartData || []} />
                <RecentActivity data={data?.recentActivity || []} />
            </div>

            {data?.userRetentionStats && (
                <UserRetentionReport stats={data.userRetentionStats} />
            )}

            {data?.accountSharingReport && data.accountSharingReport.length > 0 && (
                <AccountSharingAlert report={data.accountSharingReport} />
            )}
        </div>
    );
}
