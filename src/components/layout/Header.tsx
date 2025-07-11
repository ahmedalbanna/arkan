
"use client";

import Link from 'next/link';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Menu, User, Briefcase, BrainCircuit, HomeIcon, FileSpreadsheet, History, Bot, Palette, Languages, Gem } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocalization();
  const { user, isLoading } = useAuth();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { href: '/', label: t('header.home'), icon: HomeIcon },
    { href: '/projects', label: t('header.projects'), icon: Briefcase },
    { href: '/summarize', label: t('header.summarize'), icon: BrainCircuit },
    { href: '/generate-report', label: t('header.generateDocs'), icon: FileSpreadsheet },
    { href: '/manage-templates', label: t('header.exportTemplates'), icon: Palette },
    { href: '/history', label: t('header.activityHistory'), icon: History },
    { href: '/manage-agents', label: t('header.agentManager'), icon: Bot },
    { href: '/profile/user-1', label: t('header.profile'), icon: User },
  ];

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => (
      <Button
        key={link.href}
        asChild
        variant={pathname === link.href ? 'secondary' : 'ghost'}
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
                {renderNavLinks(true)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
            {t('header.title')}
          </Link>
        </div>

        <nav className="hidden md:flex gap-2 mx-auto">
          {renderNavLinks()}
        </nav>

        <div className="flex-1 flex justify-end items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : user ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-primary border border-primary/20 bg-primary/10 rounded-full px-3 py-1">
              <Gem className="h-4 w-4" />
              <span>{user.credits} {t('header.credits')}</span>
            </div>
          ) : null}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleLocale} aria-label="Change language">
            <Languages className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
