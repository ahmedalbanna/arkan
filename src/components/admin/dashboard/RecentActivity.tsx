'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user?: string;
  userId?: string;
  agentId?: string;
  action?: string;
  timestamp?: Date;
  createdAt?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

/**
 * RecentActivity Component
 * 
 * Displays a list of recent user activities.
 */
export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest user actions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => {
                const timestamp = activity.timestamp || (activity.createdAt ? new Date(activity.createdAt) : new Date());
                const userName = activity.user || activity.userId || 'Unknown User';
                const actionText = activity.action || `Used agent: ${activity.agentId || 'Unknown'}`;
                
                return (
                  <div key={activity.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{actionText}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(timestamp, { addSuffix: true })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
