
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

import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

export default function UserDashboardPage() {
    const { t } = useLocalization();
    const { userProfile, user } = useAuth();
    const { data: stats, isLoading, isError, error } = useUserStats();
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Immersive Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
                }}
            />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-24 animate-in fade-in duration-1000">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Personal Matrix</Badge>
                            <div className="h-3 w-px bg-primary/20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Command Center</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
                                <AreaChart className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
                                {t('userDashboard.pageTitle')}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80">
                                {t('userDashboard.pageSubtitle', { name: userProfile?.name })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/20 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm shadow-sm">
                        <Button asChild variant="ghost" size="sm" className="h-10 px-6 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300">
                            <Link href="/profile">
                                <UserCog className="h-4 w-4"/>
                                Identity Matrix
                            </Link>
                        </Button>
                        <div className="h-5 w-px bg-border/60 mx-1" />
                        <Button asChild variant="ghost" size="sm" className="h-10 px-6 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300">
                            <Link href="/payment-history">
                                <CreditCard className="h-4 w-4"/>
                                Ledger History
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    {isLoading && <DashboardSkeleton />}

                    {isError && (
                        <div className="py-20 text-center border-2 border-dashed rounded-[32px] bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto">
                            <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                            <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Matrix Error</h4>
                            <p className="text-[11px] italic leading-relaxed px-8 opacity-80">Failed to synchronize dashboard metrics. {error.message}</p>
                        </div>
                    )}

                    {stats && !isLoading && (
                        <div className="space-y-12">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <StatCard title={t('userDashboard.totalGenerations')} value={stats.totalGenerations.toString()} icon={Bot} />
                                <StatCard title={t('userDashboard.creditsRemaining')} value={(userProfile?.credits ?? 0).toString()} icon={Gem} />
                                <StatCard title={t('userDashboard.creditsUsed')} value={stats.creditsUsed.toString()} icon={TrendingDown} />
                            </div>

                            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-7">
                                <div className="lg:col-span-4 rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
                                    <AgentUsageChart data={stats.agentUsageChartData} />
                                </div>
                                <div className="lg:col-span-3 rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden">
                                    <RecentActivity data={stats.recentActivity} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="mt-32 pt-12 border-t border-border/40 text-center space-y-4">
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                        Arkan Intelligence Suite • Terminal Node V1.0 Stable
                    </p>
                </footer>
            </div>
        </div>
    );
}
