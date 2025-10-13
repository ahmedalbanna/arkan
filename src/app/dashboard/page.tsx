
'use client';

import { AgentUsageChart } from '@/components/admin/dashboard/AgentUsageChart';
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';
import { AnimatedContainer, CounterAnimation, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useChatStore, useUserStats } from '@/hooks';
import type { UserProfile } from '@/lib/types';
import { createConversationApi } from '@/services';
import { AlertCircle, AreaChart, Bot, Gem, Loader2, MessageSquare, Sparkles, TrendingDown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


function DashboardSkeleton() {
    return (
        <AnimatedContainer animation="fade-in-up" delay={0}>
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                    <div className="text-center sm:text-left">
                        <Skeleton className="h-12 w-80 mb-2" />
                        <Skeleton className="h-6 w-64" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} variant="glass" className="p-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4" variant="glass">
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Skeleton className="h-[300px] w-full rounded-lg" />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3" variant="glass">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
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
                </div>
            </div>
        </AnimatedContainer>
    );
}

export default function UserDashboardPage() {
    const { t } = useLocalization();
    const { userProfile, firebaseUser } = useAuth();
    const { data: stats, isLoading, isError, error } = useUserStats();
    const router = useRouter();
    const { createConversation, openChat } = useChatStore();
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const handleStartChatWithAdmins = async () => {
        if (!firebaseUser || !userProfile) return;
        setIsCreatingChat(true);
        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/admins');
            if (!response.ok) throw new Error('Could not fetch admins.');
            const admins: UserProfile[] = await response.json();

            if (admins.length === 0) {
                toast({ title: 'No Admins Available', description: 'There are no administrators available to chat with at the moment.', variant: 'destructive' });
                return;
            }

            const adminIds = admins.map(admin => admin.id);
            const adminNames = admins.reduce((acc, admin) => ({ ...acc, [admin.id]: admin.name }), {});

            const conversation = await createConversationApi({
                participantIds: [firebaseUser.uid, ...adminIds],
                participantNames: {
                    [firebaseUser.uid]: userProfile.name,
                    ...adminNames
                },
                title: `Support Chat with ${userProfile.name}`
            }, token);
            createConversation(conversation);
            openChat();

        } catch (error: any) {
            toast({ title: t('userDashboard.startChatError'), description: error.message, variant: "destructive" });
        } finally {
            setIsCreatingChat(false);
        }
    }


    return (
        <div className="relative flex-grow flex flex-col bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
                {/* Enhanced Header */}
                <AnimatedContainer animation="fade-in-down" delay={0}>
                    <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                        <div className="text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-600">
                                    <AreaChart className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                        {t('userDashboard.pageTitle')}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="text-xs">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Welcome back!
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            <Zap className="h-3 w-3 mr-1" />
                                            Active User
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <p className="text-lg text-muted-foreground">
                                {t('userDashboard.pageSubtitle', { name: userProfile?.name })}
                            </p>
                        </div>
                        <AnimatedContainer animation="fade-in-up" delay={200}>
                            <Button
                                onClick={handleStartChatWithAdmins}
                                disabled={isCreatingChat}
                                variant="gradient"
                                className="group hover:shadow-glow"
                            >
                                {isCreatingChat ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <MessageSquare className="me-2 h-4 w-4 group-hover:animate-wiggle" />}
                                {t('userDashboard.contactAdmin')}
                            </Button>
                        </AnimatedContainer>
                    </div>
                </AnimatedContainer>

                {isLoading && <DashboardSkeleton />}

                {isError && (
                    <div className="p-8 text-center text-destructive border rounded-lg">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>{t('userDashboard.errorLoading', { message: error.message })}</p>
                    </div>
                )}

                {stats && !isLoading && (
                    <div className="space-y-8">
                        {/* Enhanced Stats Cards */}
                        <StaggeredAnimation
                            staggerDelay={150}
                            animation="fade-in-up"
                            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        >
                            <Card variant="glass" className="p-6 group hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">{t('userDashboard.totalGenerations')}</p>
                                        <p className="text-2xl font-bold text-primary">
                                            <CounterAnimation value={stats.totalGenerations} duration={2000} delay={300} />
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="glass" className="p-6 group hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform">
                                        <Gem className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">{t('userDashboard.creditsRemaining')}</p>
                                        <p className="text-2xl font-bold text-primary">
                                            <CounterAnimation value={userProfile?.credits ?? 0} duration={2000} delay={450} />
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="glass" className="p-6 group hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 group-hover:scale-110 transition-transform">
                                        <TrendingDown className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">{t('userDashboard.creditsUsed')}</p>
                                        <p className="text-2xl font-bold text-primary">
                                            <CounterAnimation value={stats.creditsUsed} duration={2000} delay={600} />
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </StaggeredAnimation>

                        {/* Enhanced Charts Section */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                            <AnimatedContainer animation="fade-in-up" delay={800} className="lg:col-span-4">
                                <AgentUsageChart data={stats.agentUsageChartData} />
                            </AnimatedContainer>
                            <AnimatedContainer animation="fade-in-up" delay={1000} className="lg:col-span-3">
                                <RecentActivity data={stats.recentActivity} />
                            </AnimatedContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
