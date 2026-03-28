
'use client';

import { useAdminDashboard } from '@/modules/admin/adapters/hooks/use-admin-dashboard';
import { AlertCircle, Bot, CreditCard, Users } from 'lucide-react';
import { StatCard } from './StatCard';
import { AgentUsageChart } from './AgentUsageChart';
import { RecentActivity } from './RecentActivity';
import { UserRetentionReport } from './UserRetentionReport';
import { ScheduledNotificationsList } from './ScheduledNotificationsList';
import { AccountSharingAlert } from './AccountSharingAlert';
import { MultiCountryAlert } from './MultiCountryAlert';
import { SecurityAuditLog } from './SecurityAuditLog';
import { useLocalization } from '@/context/LocalizationContext';
import { DashboardSkeleton } from './skeletons';


import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Activity, Layers, Terminal } from 'lucide-react';

export default function Dashboard() {
    const { t } = useLocalization();
    const { data, isLoading, isError, error } = useAdminDashboard();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return (
            <div className="py-20 text-center border-2 border-dashed rounded-[32px] bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto">
                <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Matrix Error</h4>
                <p className="text-[11px] italic leading-relaxed px-8 opacity-80">{t('adminDashboard.errorLoading')}: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Top Zone: Essential Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title={t('adminDashboard.totalUsers')} value={data?.totalUsers.toString()} icon={Users} />
                <StatCard title={t('adminDashboard.totalGenerations')} value={data?.totalGenerations.toString()} icon={Bot} />
                <StatCard title={t('adminDashboard.pendingPayments')} value={data?.pendingPayments.toString()} icon={CreditCard} />
            </div>

            {/* Middle Zone: Intelligence & Activity */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Intelligence Matrix</h3>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-7">
                    <AgentUsageChart data={data?.agentUsageChartData || []} />
                    <RecentActivity data={data?.recentActivity || []} />
                </div>
            </section>

            {/* Strategy Zone: Growth & Retention */}
            {data?.userRetentionStats && (
                <section className="space-y-6 pt-10 border-t border-border/40">
                    <div className="flex items-center gap-3 px-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Growth Analytics</h3>
                    </div>
                    <div className="rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
                        <UserRetentionReport stats={data.userRetentionStats} />
                    </div>
                </section>
            )}

            {/* Security Zone: Threat Intelligence */}
            {(data?.accountSharingReport?.length || 0) + (data?.multiCountryLogins?.length || 0) > 0 && (
                <section className="space-y-6 pt-10 border-t border-border/40">
                    <div className="flex items-center gap-3 px-1">
                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground text-destructive">Security Overrides Required</h3>
                    </div>
                    <div className="grid gap-8">
                        {data?.accountSharingReport && data.accountSharingReport.length > 0 && (
                            <AccountSharingAlert report={data.accountSharingReport} />
                        )}

                        {data?.multiCountryLogins && data.multiCountryLogins.length > 0 && (
                            <MultiCountryAlert report={data.multiCountryLogins} />
                        )}
                    </div>
                </section>
            )}

            {/* Operational Zone: System Logs & Tasks */}
            <section className="space-y-6 pt-10 border-t border-border/40">
                <div className="flex items-center gap-3 px-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">System Governance</h3>
                </div>
                <div className="grid gap-10 lg:grid-cols-12 items-start">
                    <div className="lg:col-span-8 rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
                        <SecurityAuditLog />
                    </div>
                    <div className="lg:col-span-4 rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden h-full">
                        <ScheduledNotificationsList />
                    </div>
                </div>
            </section>

            <footer className="pt-12 text-center opacity-40 grayscale flex flex-col items-center gap-4">
                <div className="flex gap-6">
                    <ShieldCheck className="h-6 w-6" />
                    <Activity className="h-6 w-6" />
                    <Layers className="h-6 w-6" />
                    <Terminal className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
                    Arkan Intelligence Suite • Mission Control V1.0 Stable
                </p>
            </footer>
        </div>
    );
}
