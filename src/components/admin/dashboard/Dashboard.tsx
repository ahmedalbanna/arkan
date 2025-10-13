
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { Activity, AlertCircle, BarChart3, Bot, CreditCard, Users } from 'lucide-react';
import { AgentUsageChart } from './AgentUsageChart';
import { RecentActivity } from './RecentActivity';
import { StatCard } from './StatCard';


function DashboardSkeleton() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 space-y-8">
                <AnimatedContainer animation="fade-in-down" delay={200}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
                            <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                                <Activity className="h-3 w-3" />
                                Analytics Overview
                            </Badge>
                        </div>
                    </div>
                </AnimatedContainer>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                    <Card variant="glass" className="lg:col-span-4 backdrop-blur-md shadow-soft">
                         <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                         <CardContent className="pl-2">
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                    <RecentActivitySkeleton />
                </div>
            </div>
        </div>
    );
}
function StatCardSkeleton() {
    return (
        <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-blue-500/5">
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
        <Card variant="glass" className="lg:col-span-3 backdrop-blur-md shadow-soft">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="grid gap-1 flex-grow">
                            <Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-3/5" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


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
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 space-y-8">
                <AnimatedContainer animation="fade-in-down" delay={200}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
                            <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                                <Activity className="h-3 w-3" />
                                Analytics Overview
                            </Badge>
                        </div>
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StatCard title={t('adminDashboard.totalUsers')} value={data?.totalUsers.toString()} icon={Users} />
                        <StatCard title={t('adminDashboard.totalGenerations')} value={data?.totalGenerations.toString()} icon={Bot} />
                        <StatCard title={t('adminDashboard.pendingPayments')} value={data?.pendingPayments.toString()} icon={CreditCard} />
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-7">
                        <AgentUsageChart data={data?.agentUsageChartData || []} />
                        <RecentActivity data={data?.recentActivity || []} />
                    </div>
                </AnimatedContainer>
            </div>
        </div>
    );
}
