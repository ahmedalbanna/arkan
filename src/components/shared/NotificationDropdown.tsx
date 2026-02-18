
'use client';

import {
  Bell,
  CreditCard,
  Bot,
  FileText,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/context/LocalizationContext';
import { useClearNotifications, useMarkNotificationsAsRead, useNotifications } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Notification } from '@/lib/types';
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
  const { notifications } = useNotifications();
  const markAsReadMutation = useMarkNotificationsAsRead();
  const clearAllMutation = useClearNotifications();

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;
  const hasNotifications = notifications && notifications.length > 0;

  function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      markAsReadMutation.mutate([notification.id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (notifications && notifications.length > 0) {
      const notificationIds = notifications.map(n => n.id);
      clearAllMutation.mutate(notificationIds);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative transition-colors hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-pulse text-primary' : ''}`} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3">
          <h2 className="font-semibold text-sm">{t('header.notifications')}</h2>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} {unreadCount === 1 ? 'new' : 'new'}
              </Badge>
            )}
            {hasNotifications && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll} 
                disabled={clearAllMutation.isPending}
                className="h-7 text-xs"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Notifications List */}
        <ScrollArea className="h-auto max-h-96">
          {hasNotifications ? (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent group ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative mt-1">
                      <NotificationIcon icon={notification.icon} />
                      {!notification.isRead && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm leading-tight">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('header.noNotifications')}
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
