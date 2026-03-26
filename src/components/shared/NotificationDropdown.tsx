
'use client';

import {
  Bell,
  CreditCard,
  Bot,
  FileText,
  UserPlus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/context/LocalizationContext';
import { useNotifications } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BatchNotificationDialog } from '@/modules/admin/adapters/components/dashboard/BatchNotificationDialog';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Notification } from '@/modules/users/domain/entities/Notification';
import { formatDistanceToNow } from 'date-fns';

function NotificationIcon({ icon }: { icon: Notification['icon'] }) {
  switch (icon) {
    case 'credit-card':
      return <CreditCard className="h-5 w-5 text-green-500 mt-1" />;
    case 'bot':
      return <Bot className="h-5 w-5 text-primary mt-1" />;
    case 'file-text':
      return <FileText className="h-5 w-5 text-secondary-foreground mt-1" />;
    case 'user-plus':
      return <UserPlus className="h-5 w-5 text-blue-500 mt-1" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground mt-1" />;
  }
}

export function NotificationDropdown() {
  const { t } = useLocalization();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { notifications, markAsRead, clearNotifications } = useNotifications();

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.isRead).length ?? 0;

  function handleNotificationClick(notification: any) {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (notifications && (notifications as any[]).length > 0) {
      const notificationIds = (notifications as any[]).map((n: any) => n.id);
      clearNotifications(notificationIds);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t('header.notifications')}</span>
          <div className="flex gap-2">
            {userProfile?.role === 'admin' && <BatchNotificationDialog />}
            {notifications && (notifications as any[]).length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <Trash2 className="mr-1 h-3 w-3" />
                {t('header.clearAll')}
                </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-auto max-h-80">
          {notifications && notifications.length > 0 ? (
            (notifications as any[]).map((notification: any) => (
              <DropdownMenuItem key={notification.id} className="items-start" onSelect={(e) => { e.preventDefault(); handleNotificationClick(notification); }}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <NotificationIcon icon={notification.icon} />
                    {!notification.isRead && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    {notification.createdAt && (
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        {(() => {
                          try {
                            return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
                          } catch (e) {
                            return 'Recent';
                          }
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('header.noNotifications')}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
