
'use client';

import { useAuth } from '@/context/NextAuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils/cn';
import { HomeIcon, Wrench, SlidersHorizontal, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { PurchaseCreditsDialog } from '../pricing/PurchaseCreditsDialog';
import { Gem, ChevronDown } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { UserProfileDropdown } from './UserProfileDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { UserStatusBadge } from './UserStatusBadge';
import { WelcomeBanner } from './WelcomeBanner';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  return (
    <nav className="hidden md:flex flex-wrap items-center justify-center gap-1 mx-auto">
      {navLinks
        .filter(link => link.auth === 'any' || (link.auth && !!session?.user))
        .map((link) => (
          <Button
            key={link.href}
            asChild
            variant={pathname === link.href ? 'secondary' : 'ghost'}
            className="font-headline"
          >
            <Link href={link.href}>{t(link.label)}</Link>
          </Button>
        ))}
    </nav>
  );
}

function AuthActions() {
  const { t } = useLocalization();
  const { userProfile } = useAuth();

  const hasNoCredits = userProfile?.credits === 0;
  const isLowOnCredits = userProfile?.credits !== null && userProfile?.credits <= 10 && userProfile?.credits > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Credits Badge with Purchase Dialog */}
      <PurchaseCreditsDialog
        trigger={
          <Button
            variant={hasNoCredits ? "destructive" : "outline"}
            className={cn(
              'flex items-center gap-2 text-sm font-semibold transition-all duration-200',
              hasNoCredits && 'animate-pulse shadow-lg shadow-destructive/50',
              isLowOnCredits && 'border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20'
            )}
            title={hasNoCredits ? t('header.noCreditsWarning') || 'Out of credits' : ''}
          >
            <Gem className="h-4 w-4" />
            <span>{userProfile?.credits ?? 0}</span>
            {hasNoCredits && <Zap className="h-3 w-3" />}
          </Button>
        }
      />

      {/* User Status Badge */}
      <UserStatusBadge userProfile={userProfile} />

      {/* Notifications Dropdown */}
      <NotificationDropdown />

      {/* User Profile Dropdown */}
      <UserProfileDropdown />
    </div>
  );
}

function GuestActions() {
  const { t } = useLocalization();
  return (
    <Button asChild>
      <Link href="/login">{t('login.pageTitle')}</Link>
    </Button>
  );
}

export function Header() {
  const { t } = useLocalization();
  const { data: session, status } = useSession();
  const { userProfile } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;

  return (
    <>
      {/* Welcome Banner - Only shown to authenticated users on first visit */}
      {isClient && isAuthenticated && showWelcomeBanner && (
        <WelcomeBanner 
          userProfile={userProfile} 
          onDismiss={() => setShowWelcomeBanner(false)}
        />
      )}

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-16 items-center px-4 justify-between">
          {/* Left Section - Logo & Mobile Nav */}
          <div className="flex items-center gap-2">
            <MobileNav navLinks={navLinks} />
            <Link 
              href="/" 
              className="flex items-center gap-2 font-headline text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              {isClient ? t('header.title') : <Skeleton className="h-6 w-20" />}
            </Link>
          </div>

          {/* Center Section - Navigation Links (Desktop Only) */}
          {isClient && <NavLinks />}

          {/* Right Section - Auth & Theme Controls */}
          <div className="flex items-center gap-1">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : isAuthenticated ? (
              <AuthActions />
            ) : (
              <GuestActions />
            )}

            <div className="hidden md:flex items-center ml-2 pl-2 border-l border-border">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
