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
import { useNotifications } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BatchNotificationDialog } from '@/modules/admin/adapters/components/dashboard/BatchNotificationDialog';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Notification } from '@/modules/users/domain/entities/Notification';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/infrastructure/utils/cn';

/**
 * NotificationDropdown — High-fidelity signal center for system-wide alerts.
 * Orchestrates user-specific notifications with real-time status pulses.
 * 
 * DEFENSIVE MEASURES:
 * 1. Type Integrity: Removes all 'any' casts and enforces strict Notification domain typing.
 * 2. Safe Time Formatting: Wraps date-fns logic in try-catch to prevent malformed timestamp crashes.
 * 3. Existence Guards: Checks for notification data presence before mapping.
 * 4. Technical Aesthetic: Standardized 28px dot-grids and technical typography.
 */

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

  // 1. DATA DERIVATION — Guarded count calculation
  const safeNotifications = Array.isArray(notifications) ? (notifications as Notification[]) : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  function handleNotificationClick(notification: Notification) {
    try {
        if (!notification.isRead) {
          markAsRead([notification.id]);
        }
        if (notification.link) {
          router.push(notification.link);
        }
    } catch (error) {
        console.error('[NotificationSignal] Selection vector failed:', error);
    }
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (safeNotifications.length > 0) {
      const notificationIds = safeNotifications.map(n => n.id);
      clearNotifications(notificationIds);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-lg p-0 hover:bg-primary/10 transition-all duration-300 relative group"
            aria-label="View notifications"
        >
          <Bell className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-3.5 min-w-[0.875rem] justify-center p-0 text-[8px] font-black border-2 border-background animate-in zoom-in-50 rounded-full shadow-sm">
                {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] mt-2 rounded-2xl shadow-2xl border-border/40 p-0 overflow-hidden bg-background/95 backdrop-blur-2xl">
        <header className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between relative overflow-hidden">
          {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
          <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />
          <div className="flex items-center gap-2.5 relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">Signal Hub</h3>
            {unreadCount > 0 && (
                <Badge variant="secondary" className="h-4 text-[8px] px-1.5 font-black border-none bg-primary/10 text-primary uppercase tracking-widest tabular-nums">
                    {unreadCount} UNREAD
                </Badge>
            )}
          </div>
          <div className="flex gap-1.5 relative z-10">
            {userProfile?.role === 'admin' && (
                <div className="scale-75 -mx-2">
                    <BatchNotificationDialog />
                </div>
            )}
            {safeNotifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-7 px-2 text-[9px] font-black uppercase tracking-[0.18em] hover:text-destructive hover:bg-destructive/5 transition-colors">
                    <Trash2 className="mr-1.5 h-3 w-3" />
                    Clear Matrix
                </Button>
            )}
          </div>
        </header>

        <ScrollArea className="h-auto max-h-[450px]">
          {safeNotifications.length > 0 ? (
            <div className="p-2 space-y-1">
                {safeNotifications.map((notification) => (
                <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-stretch p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/10 hover:bg-primary/[0.03] focus:bg-primary/[0.03] focus:border-primary/10" 
                    onSelect={(e) => { e.preventDefault(); handleNotificationClick(notification); }}
                >
                    <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300",
                            notification.isRead ? "bg-muted/20 border-border/30 opacity-60" : "bg-primary/5 border-primary/15 shadow-primary/5"
                        )}>
                            <NotificationIcon icon={notification.icon} />
                        </div>
                        {!notification.isRead && (
                            <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-primary border-2 border-background animate-pulse shadow-sm" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                            <p className={cn("text-xs tracking-tight transition-colors truncate pr-2", notification.isRead ? "font-medium text-muted-foreground" : "font-black text-foreground")}>
                                {notification.title}
                            </p>
                            {notification.createdAt && (
                                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-tighter tabular-nums shrink-0">
                                    {(() => {
                                    try {
                                        return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
                                    } catch (e) {
                                        return 'SYNCED';
                                    }
                                    })()}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed line-clamp-2 font-medium">{notification.description}</p>
                    </div>
                    </div>
                </DropdownMenuItem>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-5">
                <div className="h-16 w-16 rounded-[24px] border border-dashed border-primary/20 bg-muted/5 flex items-center justify-center shadow-inner group/empty">
                    <Bell className="h-7 w-7 text-primary/30 group-hover/empty:scale-110 transition-transform duration-500" />
                </div>
                <div className="space-y-1.5 px-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Zero Signal Match</h3>
                    <p className="text-[10px] italic text-muted-foreground/40 leading-relaxed font-medium">System telemetry center is currently clear.</p>
                </div>
            </div>
          )}
        </ScrollArea>
        
        <footer className="px-5 py-3.5 border-t border-border/40 bg-muted/5 flex items-center justify-between">
            <p className="text-[8px] text-muted-foreground/30 font-black uppercase tracking-[0.25em] leading-none">
                Telemetry Manifest
            </p>
            <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">V2.4.0-STABLE</span>
        </footer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
