

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useLocalization } from '@/context/LocalizationContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { useTheme } from 'next-themes';
import { ScrollArea } from '../../ui/scroll-area';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });


export interface Activity {
    userId: string;
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
                    Agent: {log.agentId} | User: {log.userId}
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
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>{t('adminDashboard.recentActivityTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.length > 0 ? data.map((activity) => (
                    <Dialog key={activity.id}>
                        <DialogTrigger asChild>
                            <div className="flex items-center gap-4 cursor-pointer hover:bg-muted p-2 rounded-md">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{activity.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1 text-sm">
                                    <p className="font-semibold">{t('adminDashboard.generationBy')} <span className="font-mono text-muted-foreground">{activity.userId.substring(0, 8)}...</span></p>
                                    <p className="text-muted-foreground">{t('adminDashboard.usedAgent')} <span className="font-semibold">{activity.agentId}</span></p>
                                </div>
                                <p className="ml-auto text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </DialogTrigger>
                        <LogDetailView log={activity} />
                    </Dialog>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-8">{t('adminDashboard.noActivity')}</p>
                )}
            </CardContent>
        </Card>
    );
}
