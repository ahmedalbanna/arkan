'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useLocalization } from '@/context/LocalizationContext';

interface Activity {
    userId: string;
    agentId: string;
    createdAt: string;
}

interface RecentActivityProps {
    data: Activity[];
}

export function RecentActivity({ data }: RecentActivityProps) {
    const { t } = useLocalization();
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>{t('adminDashboard.recentActivityTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.length > 0 ? data.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
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
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-8">{t('adminDashboard.noActivity')}</p>
                )}
            </CardContent>
        </Card>
    );
}
