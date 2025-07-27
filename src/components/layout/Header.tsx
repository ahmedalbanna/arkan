

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Menu, User, HomeIcon, SlidersHorizontal, Bot, Palette, Languages, Gem, FileImage, Users, LogOut, UserCog, CreditCard, FileText, PencilLine, FileQuestion, BookCheck, History, LayoutDashboard, Settings, PencilRuler, BookOpenCheck, FolderOpen, Upload, AreaChart, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/use-user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';


export function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocalization();
  const { firebaseUser, userProfile, isLoading: isLoadingAuth } = useAuth();  
  const logoutMutation = useLogout(); // Use the useLogout mutation hook
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // This prevents hydration mismatches by ensuring the component only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { href: '/', label: t('header.home'), icon: HomeIcon },
    { href: '/projects', label: 'My Projects', icon: FolderOpen },
    { href: '/generate', label: t('header.generateDocs'), icon: SlidersHorizontal },
    { href: '/ui-agent', label: 'UI Agent', icon: LayoutGrid },
    { href: '/academic-solver', label: t('header.academicSolver'), icon: BookCheck },
    { href: '/docs', label: t('header.documentation'), icon: BookOpenCheck },
  ];
  
  const adminLinks = [
    { href: '/admin/dashboard', label: t('adminDashboard.pageTitle'), icon: LayoutDashboard },
    { href: '/admin/manage-users', label: t('header.manageUsers'), icon: Users },
    { href: '/admin/manage-payments', label: t('header.managePayments'), icon: CreditCard },
    { href: '/admin/manage-agents', label: t('header.agentManager'), icon: Bot },
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
    links.map((link) => (
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
    
  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutate(); // Trigger the logout mutation
  };

  // The condition `!isClient || isLoadingAuth` ensures we show a skeleton until client has mounted and auth state is determined.
  const showSkeleton = !isClient || isLoadingAuth;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{isClient ? t('header.openMenu') : 'Open Menu'}</span>
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

        <div className="flex-1 flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
            {isClient ? t('header.title') : <Skeleton className="h-6 w-20" />}
          </Link>
        </div>
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-1 mx-auto">
          {isClient ? renderNavLinks(navLinks) : <Skeleton className="h-10 w-48" />}
        </nav>

        <div className="flex-1 flex justify-end items-center gap-2">
          {showSkeleton ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : firebaseUser && userProfile ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/pricing" className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Gem className="h-4 w-4" />
                  <span>{userProfile.credits} {isClient && t('header.credits')}</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userProfile.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${firebaseUser.uid}`}>
                      <UserCog className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <AreaChart className="mr-2 h-4 w-4" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/payment-history">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Payment History
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/team/manage">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/handwriting">
                      <PencilLine className="mr-2 h-4 w-4" />
                      Handwriting
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pdf-to-markdown">
                      <FileText className="mr-2 h-4 w-4" />
                      PDF to Markdown
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild><Link href="/login">Login</Link></Button>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleLocale} aria-label="Change language">
            <Languages className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
