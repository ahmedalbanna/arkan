
'use client';

import { useUserStats } from '@/hooks/use-analytics';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/admin/StatCard';
import { AgentUsageChart } from '@/components/admin/AgentUsageChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { AlertCircle, Bot, History, AreaChart, TrendingDown, Gem } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
    const { userProfile } = useAuth();
    const { data: stats, isLoading, isError, error } = useUserStats();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                    <AreaChart className="w-10 h-10" />
                    My Dashboard
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Here's a summary of your activity, {userProfile?.name}.
                </p>
            </div>

            {isLoading && <DashboardSkeleton />}
            
            {isError && (
                 <div className="p-8 text-center text-destructive border rounded-lg">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>Could not load your analytics: {error.message}</p>
                </div>
            )}

            {stats && !isLoading && (
                <div className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="Total AI Generations" value={stats.totalGenerations.toString()} icon={Bot} />
                        <StatCard title="Credits Remaining" value={userProfile?.credits.toString()} icon={Gem} />
                        <StatCard title="Total Credits Used" value={stats.creditsUsed.toString()} icon={TrendingDown} />
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
