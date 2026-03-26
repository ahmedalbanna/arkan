
'use client';

import { useUserStats } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/modules/admin/adapters/components/dashboard/StatCard';
import { AgentUsageChart } from '@/modules/admin/adapters/components/dashboard/AgentUsageChart';
import { RecentActivity } from '@/modules/admin/adapters/components/dashboard/RecentActivity';
import { AlertCircle, Bot, History, AreaChart, TrendingDown, Gem, MessageSquare, Loader2, UserCog, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { useLocalization } from '@/context/LocalizationContext';
import Link from 'next/link';


function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                     <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                     <CardContent className="pl-2"><Skeleton className="h-[300px] w-full" /></CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                     <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center gap-4"><Skeleton className="h-9 w-9 rounded-full" /><div className="grid gap-1 flex-grow"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-3/5" /></div></div>
                        <div className="flex items-center gap-4"><Skeleton className="h-9 w-9 rounded-full" /><div className="grid gap-1 flex-grow"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-3/5" /></div></div>
                        <div className="flex items-center gap-4"><Skeleton className="h-9 w-9 rounded-full" /><div className="grid gap-1 flex-grow"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-3/5" /></div></div>
                     </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function UserDashboardPage() {
    const { t } = useLocalization();
    const { userProfile, user } = useAuth();
    const { data: stats, isLoading, isError, error } = useUserStats();
    const router = useRouter();
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="flex justify-between items-start mb-12 flex-wrap gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center sm:justify-start gap-4">
                        <AreaChart className="w-10 h-10" />
                        {t('userDashboard.pageTitle')}
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        {t('userDashboard.pageSubtitle', { name: userProfile?.name })}
                    </p>
                </div>
                 <div className="flex gap-2 justify-center w-full sm:w-auto">
                    <Button asChild variant="outline">
                        <Link href="/profile">
                            <UserCog className="mr-2 h-4 w-4"/>
                            View Profile
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                         <Link href="/payment-history">
                            <CreditCard className="mr-2 h-4 w-4"/>
                            Payment History
                        </Link>
                    </Button>
                </div>
            </div>

            {isLoading && <DashboardSkeleton />}

            {isError && (
                 <div className="p-8 text-center text-destructive border rounded-lg">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>{t('userDashboard.errorLoading', { message: error.message })}</p>
                </div>
            )}

            {stats && !isLoading && (
                <div className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StatCard title={t('userDashboard.totalGenerations')} value={stats.totalGenerations.toString()} icon={Bot} />
                        <StatCard title={t('userDashboard.creditsRemaining')} value={(userProfile?.credits ?? 0).toString()} icon={Gem} />
                        <StatCard title={t('userDashboard.creditsUsed')} value={stats.creditsUsed.toString()} icon={TrendingDown} />
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                        <AgentUsageChart data={stats.agentUsageChartData} />
                        <RecentActivity data={stats.recentActivity} />
                    </div>
                </div>
            )}
        </div>
    );
}
