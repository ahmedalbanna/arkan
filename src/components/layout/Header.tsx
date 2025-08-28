
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, HomeIcon, SlidersHorizontal, Bot, Palette, Languages, Gem, FileImage, Users, LogOut, UserCog, CreditCard, FileText, PencilLine, History, LayoutDashboard, Settings, PencilRuler, BookOpenCheck, FolderOpen, AreaChart, Bell, Trash2, UserPlus, LifeBuoy, MoreVertical, Brush, PenSquare, Workflow, Wrench } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/use-user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkNotificationsAsRead, useClearAllNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import type { Notification, UserProfile } from '@/lib/types';
import { useChatStore } from '@/hooks/useChatStore';
import { toast } from '@/hooks/use-toast';
import { initiateSupportChat } from '@/services/chat-service';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label } from '@/components/ui/label';


function NotificationIcon({ icon }: { icon: Notification['icon']}) {
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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useLocalization();
  const { firebaseUser, userProfile, isLoading: isLoadingAuth } = useAuth();
  const logoutMutation = useLogout();
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const markAsReadMutation = useMarkNotificationsAsRead();
  const clearAllMutation = useClearAllNotifications();
  const { createConversation, openChat } = useChatStore();
  const isMobile = useIsMobile();


  useEffect(() => {
    setIsClient(true);
  }, []);

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read only if it's currently unread
    if (!notification.isRead) {
        markAsReadMutation.mutate([notification.id]);
    }
    // Navigate if a link exists
    if (notification.link) {
        router.push(notification.link);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notifications && notifications.length > 0) {
        const notificationIds = notifications.map(n => n.id);
        clearAllMutation.mutate(notificationIds);
    }
  };


  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { href: '/', label: t('header.home'), icon: HomeIcon, auth: 'any' },
    { href: '/projects', label: t('header.projects'), icon: FolderOpen, auth: true },
    { href: '/generate', label: t('header.generateDocs'), icon: SlidersHorizontal, auth: true },
    { href: '/pricing', label: t('header.pricing'), icon: Gem, auth: 'any' },
    { href: '/docs', label: t('header.documentation'), icon: BookOpenCheck, auth: 'any'},
  ];

  const toolsLinks = [
      { href: '/writing-tools', label: 'Writing Tools', icon: PenSquare },
      { href: '/handwriting', label: 'Text to Handwriting', icon: PencilLine },
      { href: '/pdf-to-markdown', label: 'PDF to Markdown', icon: FileText },
      { href: '/markdown-display', label: 'Markdown Editor', icon: PencilRuler },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: t('adminDashboard.pageTitle'), icon: LayoutDashboard },
    { href: '/admin/manage-users', label: t('header.manageUsers'), icon: Users },
    { href: '/admin/manage-payments', label: t('header.managePayments'), icon: CreditCard },
    { href: '/admin/manage-agents', label: t('header.agentManager'), icon: Bot },
    { href: '/admin/manage-features', label: t('header.manageFeatures'), icon: SlidersHorizontal },
    { href: '/admin/manage-generations', label: t('header.activityHistory'), icon: History },
    { href: '/admin/manage-generation-templates', label: 'Generation Templates', icon: PencilRuler },
    { href: '/admin/manage-templates', label: t('header.exportTemplates'), icon: Palette },
    { href: '/admin/manage-pptx-templates', label: t('header.pptxTemplates'), icon: FileImage },
    { href: '/admin/settings', label: t('header.adminSettings'), icon: Settings },
  ];

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  const renderNavLinks = (links: typeof navLinks, isMobile = false) =>
    links
      .filter(link => link.auth === 'any' || (link.auth && firebaseUser))
      .map((link) => (
        <Button
          key={link.href}
          asChild
          variant={pathname.startsWith(link.href) && link.href !== '/' || pathname === '/' && link.href === '/' ? 'secondary' : 'ghost'}
          className={cn(
            'font-headline',
            isMobile && 'w-full justify-start text-lg py-6'
          )}
          onClick={isMobile ? handleLinkClick : undefined}
        >
          <Link href={link.href}>
            {isMobile && <link.icon className="ml-4 rtl:ml-0 rtl:mr-4 h-5 w-5" />}
            {link.label}
          </Link>
        </Button>
      ));

  const handleLogout = async () => {
    await logoutMutation.mutate();
  };

  const showSkeleton = !isClient || isLoadingAuth;

  const hasNoCredits = userProfile && userProfile.credits === 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-2">
            <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label={isClient ? t('header.openMenu') : 'Open Menu'}>
                    <Menu className="h-6 w-6" />
                </Button>
                </SheetTrigger>
                <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-full max-w-sm flex flex-col">
                    <SheetTitle className="sr-only">{isClient ? t('header.openMenu') : 'Open Menu'}</SheetTitle>
                    <ScrollArea className="flex-grow mt-8">
                    <nav className="flex flex-col gap-4 pr-6">
                        {isClient ? renderNavLinks(navLinks, true) : <Skeleton className="h-10 w-full" />}
                        {userProfile?.role === 'admin' && (
                        <>
                            <div className="my-4 border-t"></div>
                            {adminLinks.map((link) => (
                            <Button
                                key={link.href}
                                asChild
                                variant="ghost"
                                className="font-headline w-full justify-start text-lg py-6"
                                onClick={handleLinkClick}
                            >
                                <Link href={link.href}>
                                <link.icon className="ml-4 rtl:ml-0 rtl:mr-4 h-5 w-5" />
                                {link.label}
                                </Link>
                            </Button>
                            ))}
                        </>
                        )}
                    </nav>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
            </div>

            <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
                {isClient ? t('header.title') : <Skeleton className="h-6 w-20" />}
            </Link>
        </div>

        <nav className="hidden md:flex flex-wrap items-center justify-center gap-1 mx-auto">
          {isClient ? renderNavLinks(navLinks) : <Skeleton className="h-10 w-48" />}
        </nav>

        <div className="flex items-center gap-2">
          {showSkeleton ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-5" />
            </div>
          ) : firebaseUser && userProfile ? (
            <>
               <TooltipProvider>
                  <Tooltip open={hasNoCredits ? undefined : false}>
                    <TooltipTrigger asChild>
                       <Button
                        variant="outline"
                        asChild
                        className={cn(
                          'flex items-center gap-2 text-sm font-semibold text-primary',
                          hasNoCredits && 'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive animate-pulse'
                        )}
                      >
                        <Link href="/pricing">
                          <Gem className="h-4 w-4" />
                          <span>{userProfile.credits} {isClient && t('header.credits')}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {hasNoCredits && (
                      <TooltipContent>
                        <p>You have run out of credits. Please purchase more.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle user menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userProfile.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={`/profile/${firebaseUser.uid}`}><UserCog className="me-2 h-4 w-4" />{t('header.profile')}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard"><AreaChart className="me-2 h-4 w-4" />{t('header.myDashboard')}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/team/manage"><Users className="me-2 h-4 w-4" />{t('header.manageTeam')}</Link></DropdownMenuItem>
                   <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Wrench className="me-2 h-4 w-4" />
                            <span>{t('header.tools')}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                             {toolsLinks.map(link => (
                                <DropdownMenuItem key={link.href} asChild>
                                    <Link href={link.href}>
                                        <link.icon className="me-2 h-4 w-4" />
                                        {link.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  <DropdownMenuItem asChild><Link href="/payment-history"><CreditCard className="me-2 h-4 w-4" />{t('header.paymentHistory')}</Link></DropdownMenuItem>
                  {userProfile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                        <LayoutDashboard className="me-2 h-4 w-4" />
                        {t('header.admin')}
                        </Link>
                    </DropdownMenuItem>
                   )}
                   {isMobile && (
                     <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex justify-between">
                          <Label htmlFor="theme-toggle-mobile" className="flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</Label>
                          <ThemeToggle />
                      </DropdownMenuItem>
                       <DropdownMenuItem className="flex justify-between">
                          <Label htmlFor="lang-toggle-mobile" className="flex items-center gap-2"><Languages className="h-4 w-4" /> Language</Label>
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleLocale}
                              aria-label="Change language"
                            >
                              <span className="text-xs font-bold">{locale.toUpperCase()}</span>
                          </Button>
                      </DropdownMenuItem>
                     </>
                   )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogOut className="me-2 h-4 w-4" />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
                      {notifications && notifications.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleClearAll} disabled={clearAllMutation.isPending}>
                          <Trash2 className="mr-1 h-3 w-3" />
                           {t('header.clearAll')}
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-auto max-h-80">
                      {notifications && notifications.length > 0 ? (
                        notifications.map(notification => (
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
                                      <p className="text-xs text-muted-foreground/80 mt-1">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
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
            </>
          ) : (
            <Button asChild><Link href="/login">{t('login.pageTitle')}</Link></Button>
          )}
          {!isMobile && isClient && <ThemeToggle />}
          {!isMobile && <Button variant="ghost" size="icon" onClick={toggleLocale} aria-label="Change language">
            <Languages className="h-5 w-5" />
          </Button>}
        </div>
      </div>
    </header>
  );
}
