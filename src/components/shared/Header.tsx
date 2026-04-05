'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/infrastructure/utils/cn';
import { HomeIcon, Wrench, SlidersHorizontal, BookOpenText, Gem, LogIn, Clock } from 'lucide-react';
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

/**
 * Global Header — Primary navigation and status orchestrator.
 * 
 * DEFENSIVE MEASURES:
 * 1. Atmospheric Grid: Unified 28px dot-grid aligned with workspace canvas.
 * 2. Existence Guards: Checks for userProfile before rendering HUD dependencies.
 * 3. Hydration Sync: Optimized isClient pattern to prevent cumulative layout shift.
 * 4. Fallback Labels: Safe localization resolution with hardcoded defaults.
 */

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
  const { status } = useAuth();

  const isAuthenticated = status === 'authenticated' || status === 'guest';

  return (
    <nav className="hidden md:flex flex-wrap items-center justify-center gap-1 mx-auto bg-muted/20 p-1 rounded-xl border border-border/40 backdrop-blur-sm relative z-10">
      {navLinks
        .filter(link => link.auth === 'any' || (link.auth && isAuthenticated))
        .map((link) => {
          const isActive = pathname === link.href;
          const label = t(link.label) || 'NAVIGATION_NODE';
          
          return (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className={cn(
                "h-8 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-lg",
                isActive
                  ? "bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Link href={link.href}>
                <link.icon className={cn("h-3.5 w-3.5 mr-2", isActive ? "text-primary" : "text-muted-foreground/60")} />
                {label}
              </Link>
            </Button>
          );
        })}
    </nav>
  );
}

function AuthActions() {
  const { t } = useLocalization();
  const { userProfile, status } = useAuth();

  // Guard: Early return if profile is not yet materialized
  if (!userProfile && status !== 'guest') return <Skeleton className="h-9 w-32 rounded-xl" />;

  const credits = userProfile?.credits ?? 0;
  const hasNoCredits = credits === 0;

  return (
    <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40 backdrop-blur-sm relative z-10">
      <PurchaseCreditsDialog
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300',
              hasNoCredits
                ? 'text-destructive animate-pulse hover:bg-destructive/10'
                : 'text-primary hover:bg-primary/10'
            )}
          >
            <Gem className="h-3.5 w-3.5" />
            <span>{credits} {t('header.credits') || 'QUOTA'}</span>
          </Button>
        }
      />

      <div className="h-4 w-px bg-border/60 mx-0.5" aria-hidden />

      <NotificationDropdown />
      <UserProfileDropdown />
    </div>
  );
}

function GuestActions() {
  const { t } = useLocalization();
  return (
    <Button asChild size="sm" className="h-9 px-5 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 gap-2 rounded-xl relative z-10 ring-1 ring-inset ring-white/10">
      <Link href="/login">
        <LogIn className="h-3.5 w-3.5" />
        {t('login.pageTitle') || 'SYSTEM_ENTRY'}
      </Link>
    </Button>
  );
}

export function Header() {
  const { t } = useLocalization();
  const { status } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const titleLabel = isClient ? (t('header.title') || 'ARKAN') : '...';
  const isAuthenticated = status === 'authenticated' || status === 'guest';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl transition-all duration-700 ease-in-out group/header">
      <div className="flex h-16 items-center px-6 justify-between mx-auto relative overflow-hidden">
        {/* Animated Intelligence Grid — Aligned with Builder standards (28px) */}
        <div 
            className="absolute inset-0 z-[-1] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
            style={{ 
                backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, hsl(var(--primary)) 1px, transparent 0)', 
                backgroundSize: '28px 28px' 
            }} 
        />
        <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />

        <div className="flex items-center gap-4 relative z-10">
          <MobileNav navLinks={navLinks} />
          <Link href="/" className="flex items-center gap-4 group/logo">
            <div className="relative">
                <div className="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-0 group-hover/logo:opacity-100 transition duration-500" />
                <div className="relative h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-500 border border-primary/20 overflow-hidden">
                    <BookOpenText className="h-5 w-5 text-primary-foreground relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                </div>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-[1.1rem] font-black tracking-tight text-foreground leading-none uppercase">
                {titleLabel}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                 <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                 <span className="text-[8px] font-black uppercase tracking-[0.25em] text-primary/60 leading-none">
                    Arkan Intelligence Suite
                 </span>
              </div>
            </div>
          </Link>
        </div>

        {isClient && status !== 'loading' && <NavLinks />}

        <div className="flex items-center gap-5 relative z-10">
          <div className="flex items-center gap-2">
            {!isClient || status === 'loading' ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            ) : isAuthenticated ? (
                <AuthActions />
            ) : (
                <GuestActions />
            )}
          </div>

          <div className="h-5 w-px bg-border/40 hidden md:block" aria-hidden />

          <div className="hidden md:flex items-center gap-1 bg-muted/5 p-1 rounded-xl border border-border/40 shadow-inner backdrop-blur-md">
            <ThemeToggle />
            <div className="h-3 w-px bg-border/40 mx-0.5" aria-hidden />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
