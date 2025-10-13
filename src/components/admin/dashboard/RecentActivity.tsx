
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Clock } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });


interface Activity {
    userId: string;
    userName?: string;
    agentId: string;
    createdAt: string;
    id: string;
    input: any;
    output: any;
}

interface RecentActivityProps {
    data: Activity[];
}

function LogDetailView({ log }: { log: Activity }) {
    const { resolvedTheme } = useTheme();

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Generation Details</DialogTitle>
                <DialogDescription>
                    Agent: {log.agentId}
                    {log.userName && ` | User: ${log.userName} (${log.userId})`}
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh]">
                <div className="space-y-2">
                    <h4 className="font-semibold">Input</h4>
                    <ScrollArea className="h-full max-h-[60vh] border rounded-md">
                        <ReactJson
                            src={log.input}
                            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'}
                            collapsed={2}
                            displayDataTypes={false}
                            name={false}
                        />
                    </ScrollArea>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Output</h4>
                     <ScrollArea className="h-full max-h-[60vh] border rounded-md">
                        <ReactJson
                            src={log.output}
                            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'}
                            collapsed={2}
                            displayDataTypes={false}
                            name={false}
                        />
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    );
}


export function RecentActivity({ data }: RecentActivityProps) {
    const { t } = useLocalization();
    return (
            <Card variant="glass" className="lg:col-span-3 backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-headline">{t('adminDashboard.recentActivityTitle')}</CardTitle>
                            <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                Live Activity
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.length > 0 ? data.map((activity, index) => (
                        <Dialog key={activity.id}>
                            <DialogTrigger asChild>
                                <AnimatedContainer animation="fade-in-up" delay={100 + (index * 100)}>
                                    <div className="flex items-center gap-4 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 p-3 rounded-lg transition-all duration-200 hover:shadow-soft group">
                                        <Avatar className="h-9 w-9 hidden sm:flex border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-200">
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold group-hover:scale-105 transition-transform duration-200">
                                                {activity.userName ? activity.userName.charAt(0) : 'Y'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1 text-sm flex-grow">
                                            {activity.userName && (
                                                <p className="font-semibold group-hover:text-primary transition-colors duration-200">
                                                    {t('adminDashboard.generationBy')}
                                                    <span className="text-muted-foreground ml-1">{activity.userName}</span>
                                                </p>
                                            )}
                                            <p className="text-muted-foreground">
                                                {t('adminDashboard.usedAgent')}
                                                <span className="font-semibold text-primary ml-1">{activity.agentId}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </AnimatedContainer>
                            </DialogTrigger>
                            <LogDetailView log={activity} />
                        </Dialog>
                    )) : (
                        <AnimatedContainer animation="fade-in-up" delay={200}>
                            <div className="text-center py-8">
                                <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 w-fit mx-auto mb-4">
                                    <Activity className="h-8 w-8 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">{t('adminDashboard.noActivity')}</p>
                            </div>
                        </AnimatedContainer>
                    )}
                </CardContent>
                </AnimatedContainer>
            </Card>

    );
}
