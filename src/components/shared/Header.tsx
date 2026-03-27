'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/infrastructure/utils/cn';
import { HomeIcon, Wrench, SlidersHorizontal, BookOpenText, Gem, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { PurchaseCreditsDialog } from '@/modules/billing/adapters/components/pricing/PurchaseCreditsDialog';
import { MobileNav } from './MobileNav';
import { UserProfileDropdown } from './UserProfileDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { Separator } from '@/components/ui/separator';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  auth: boolean | 'any';
}

const navLinks: NavLink[] = [
  { href: '/', label: 'header.home', icon: HomeIcon, auth: 'any' },
  { href: '/builder', label: 'header.generateDocs', icon: SlidersHorizontal, auth: true },
  { href: '/writing-tools', label: 'header.tools', icon: Wrench, auth: true },
];

function NavLinks() {
  const pathname = usePathname();
  const { t } = useLocalization();
  const { user } = useAuth();

  return (
    <nav className="hidden md:flex flex-wrap items-center justify-center gap-2 mx-auto bg-muted/20 p-1 rounded-xl border border-border/40 backdrop-blur-sm">
      {navLinks
        .filter(link => link.auth === 'any' || (link.auth && !!user))
        .map((link) => {
          const isActive = pathname === link.href;
          return (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className={cn(
                "h-8 px-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-lg",
                isActive
                  ? "bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Link href={link.href}>
                <link.icon className={cn("h-3.5 w-3.5 mr-2", isActive ? "text-primary" : "text-muted-foreground/60")} />
                {t(link.label)}
              </Link>
            </Button>
          );
        })}
    </nav>
  );
}

function AuthActions() {
  const { t } = useLocalization();
  const { userProfile } = useAuth();

  const hasNoCredits = userProfile?.credits === 0;

  return (
    <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40 backdrop-blur-sm">
      <PurchaseCreditsDialog
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300',
              hasNoCredits
                ? 'text-destructive animate-pulse hover:bg-destructive/10'
                : 'text-primary hover:bg-primary/10'
            )}
          >
            <Gem className="h-3.5 w-3.5" />
            <span>{userProfile?.credits ?? 0} {t('header.credits')}</span>
          </Button>
        }
      />

      <div className="h-4 w-px bg-border/60 mx-0.5" />

      <NotificationDropdown />
      <UserProfileDropdown />
    </div>
  );
}

function GuestActions() {
  const { t } = useLocalization();
  return (
    <Button asChild size="sm" className="h-9 px-5 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 gap-2">
      <Link href="/login">
        <LogIn className="h-3.5 w-3.5" />
        {t('login.pageTitle')}
      </Link>
    </Button>
  );
}

export function Header() {
  const { t } = useLocalization();
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-500">
      <div className="flex h-16 items-center px-6 justify-between mx-auto">
        <div className="flex items-center gap-4">
          <MobileNav navLinks={navLinks} />
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <BookOpenText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-lg font-bold tracking-tight text-foreground leading-none">
                {isClient ? t('header.title') : <Skeleton className="h-5 w-24" />}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 mt-1 leading-none">
                AI Intelligence
              </span>
            </div>
          </Link>
        </div>

        {isClient && <NavLinks />}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isClient ? (
              isLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-24 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              ) : user ? (
                <AuthActions />
              ) : (
                <GuestActions />
              )
            ) : (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-border/40 hidden md:block" />

          <div className="hidden md:flex items-center gap-1.5 bg-muted/20 p-1 rounded-xl border border-border/40 shadow-inner">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
