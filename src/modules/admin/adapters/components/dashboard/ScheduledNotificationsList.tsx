'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/infrastructure/api/ApiService';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import { XCircle, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/util/use-toast';

export function ScheduledNotificationsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin', 'scheduled-notifications'],
    queryFn: () => apiService<undefined, any[]>({ 
        endpoint: '/api/admin/notifications/scheduled' 
    }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiService({
        endpoint: `/api/admin/notifications/scheduled?id=${id}`,
        method: 'DELETE'
    }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'scheduled-notifications'] });
        toast({ title: "Cancelled", description: "Scheduled notification has been cancelled." });
    },
    onError: (error: any) => {
        toast({ title: "Error", description: error.message || "Failed to cancel", variant: 'destructive' });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Scheduled Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification</TableHead>
              <TableHead>Scheduled For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(notifications || []).map((n) => (
              <TableRow key={n.id}>
                <TableCell>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{n.description}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{format(new Date(n.scheduledFor), 'MMM d, HH:mm')}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.scheduledFor) > new Date() 
                        ? `In ${formatDistanceToNow(new Date(n.scheduledFor))}`
                        : `Past due`}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={n.status} />
                </TableCell>
                <TableCell className="text-right">
                  {n.status === 'pending' && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => cancelMutation.mutate(n.id)}
                        disabled={cancelMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!notifications || notifications.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                  No scheduled notifications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'pending':
            return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Pending</Badge>;
        case 'sent':
            return <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Sent</Badge>;
        case 'failed':
            return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Failed</Badge>;
        case 'cancelled':
            return <Badge variant="outline" className="text-muted-foreground border-slate-200 bg-slate-50">Cancelled</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
