'use client';

import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils/cn';
import { Gem, HomeIcon, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PurchaseCreditsDialog } from '../pricing/PurchaseCreditsDialog';
import { MobileNav } from './MobileNav';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  auth: boolean | 'any';
}

const navLinks: NavLink[] = [
  { href: '/', label: 'header.home', icon: HomeIcon, auth: 'any' },
  { href: '/builder', label: 'header.generateDocs', icon: SlidersHorizontal, auth: true },
];

function NavLinks() {
  const pathname = usePathname();
  const { t } = useLocalization();
  const { firebaseUser } = useAuth();

  return (
    <nav className="hidden md:flex flex-wrap items-center justify-center gap-1 mx-auto">
      {navLinks
        .filter(link => link.auth === 'any' || (link.auth && !!firebaseUser))
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

  return (
    <>
      <PurchaseCreditsDialog
        trigger={
          <Button
            variant="outline"
            className={cn(
              'flex items-center gap-2 text-sm font-semibold text-primary',
              hasNoCredits && 'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive animate-pulse'
            )}
          >
            <Gem className="h-4 w-4" />
            <span>{userProfile?.credits ?? 0} {t('header.credits')}</span>
          </Button>
        }
      />
      <UserProfileDropdown />
      <NotificationDropdown />
    </>
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
  const { firebaseUser, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <MobileNav navLinks={navLinks} />
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
            {isClient ? t('header.title') : <Skeleton className="h-6 w-20" />}
          </Link>
        </div>

        {isClient && <NavLinks />}

        <div className="flex items-center gap-2">
          {isClient ? (
            isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : firebaseUser ? (
              <AuthActions />
            ) : (
              <GuestActions />
            )
          ) : (
            // Fallback skeleton for server-side rendering to prevent hydration mismatch
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          )}

          <div className="hidden md:flex">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
