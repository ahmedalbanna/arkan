
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Menu, User, HomeIcon, SlidersHorizontal, Bot, Palette, Languages, Gem, FileImage, Users, LogOut, UserCog } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/use-user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocalization();
  const { firebaseUser, userProfile, isLoading: isLoadingAuth } = useAuth(); // Get firebaseUser, userProfile, and loading state
  const logoutMutation = useLogout(); // Use the useLogout mutation hook
  const [isClient, setIsClient] = useState(false);

  // This prevents hydration mismatches by ensuring the component only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { href: '/', label: t('header.home'), icon: HomeIcon },
    { href: '/generate', label: t('header.generateDocs'), icon: SlidersHorizontal },
  ];
  
  const adminLinks = [
    { href: '/manage-users', label: t('header.manageUsers'), icon: Users },
    { href: '/manage-templates', label: t('header.exportTemplates'), icon: Palette },
    { href: '/manage-pptx-templates', label: t('header.pptxTemplates'), icon: FileImage },
    { href: '/manage-agents', label: t('header.agentManager'), icon: Bot },
  ];

  const renderNavLinks = (links: typeof navLinks | typeof adminLinks, isMobile = false) =>
    links.map((link) => (
      <Button
        key={link.href}
        asChild
        variant={pathname.startsWith(link.href) && link.href !== '/' || pathname === '/' && link.href === '/' ? 'secondary' : 'ghost'}
        className={cn(
          'font-headline',
          isMobile && 'w-full justify-start text-lg py-6'
        )}
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{t('header.openMenu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-full max-w-sm">
              <SheetTitle className="sr-only">{t('header.openMenu')}</SheetTitle>
              <nav className="flex flex-col gap-4 pt-8">
                {renderNavLinks(navLinks, true)}
                {userProfile?.role === 'admin' && (
                  <>
                    <div className="my-4 border-t"></div>
                    {renderNavLinks(adminLinks, true)}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
            {t('header.title')}
          </Link>
        </div>
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-1 mx-auto">
          {renderNavLinks(navLinks)}
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
                  <span>{userProfile.credits} {t('header.credits')}</span>
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
                  {userProfile.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href="/manage-users">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Users
                        </Link>
                    </DropdownMenuItem>
                  )}
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
