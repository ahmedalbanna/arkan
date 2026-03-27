
'use client';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, LayoutDashboard, Users, CreditCard, Bot, History, PencilRuler, Palette, Settings, SlidersHorizontal, BookOpenText } from 'lucide-react';
import Link from 'next/link';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/infrastructure/utils/cn';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  auth: boolean | 'any';
}

const adminLinks = [
    { href: '/admin/dashboard', labelKey: 'adminDashboard.pageTitle', icon: LayoutDashboard },
    { href: '/admin/manage-users', labelKey: 'header.manageUsers', icon: Users },
    { href: '/admin/manage-payments', labelKey: 'header.managePayments', icon: CreditCard },
    { href: '/admin/manage-agents', labelKey: 'header.agentManager', icon: Bot },
    { href: '/admin/manage-features', labelKey: 'header.manageFeatures', icon: SlidersHorizontal },
    { href: '/admin/manage-generations', labelKey: 'header.activityHistory', icon: History },
    { href: '/admin/manage-sections', labelKey: 'header.manageSections', icon: PencilRuler },
    { href: '/admin/manage-templates', labelKey: 'header.exportTemplates', icon: Palette },
    { href: '/admin/settings', labelKey: 'header.adminSettings', icon: Settings },
];

export function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const { t, locale } = useLocalization();
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function handleLinkClick() {
    setIsOpen(false);
  }

  function renderLinks(links: NavLink[], isMobile = false) {
    return links
      .filter(link => link.auth === 'any' || (link.auth && user))
      .map((link) => {
        const isActive = pathname.startsWith(link.href) && link.href !== '/' || pathname === '/' && link.href === '/';
        return (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className={cn(
                'w-full justify-start h-14 rounded-2xl gap-4 px-6 text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300',
                isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              )}
              onClick={isMobile ? handleLinkClick : undefined}
            >
              <Link href={link.href}>
                <link.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-primary/60")} />
                {t(link.label)}
              </Link>
            </Button>
        );
      });
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary active:scale-90"
            aria-label={t('header.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-full max-w-[320px] flex flex-col p-0 border-none shadow-2xl">
          <header className="px-8 py-10 border-b bg-muted/5">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <BookOpenText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="font-headline text-base font-bold tracking-tight leading-none mb-1">Arkan</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 leading-none">Intelligence Suite</span>
                </div>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-2 p-6 pb-20">
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 px-2">Navigation Matrix</div>
              {renderLinks(navLinks, true)}

              {userProfile?.role === 'admin' && (
                <>
                  <div className="my-6 border-t border-border/40 relative">
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-background text-[8px] font-black uppercase tracking-[0.4em] text-primary/40">System Console</span>
                  </div>
                  <div className="space-y-1">
                    {adminLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Button
                                key={link.href}
                                asChild
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start h-12 rounded-xl gap-4 px-6 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                                    isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5'
                                        : 'text-muted-foreground/60 hover:bg-primary/5 hover:text-primary'
                                )}
                                onClick={handleLinkClick}
                            >
                                <Link href={link.href}>
                                    <link.icon className={cn("h-4.5 w-4.5", isActive ? "text-primary" : "text-muted-foreground/40")} />
                                    {t(link.labelKey)}
                                </Link>
                            </Button>
                        );
                    })}
                  </div>
                </>
              )}
            </nav>
          </ScrollArea>

          <footer className="p-6 border-t bg-muted/5 mt-auto">
            <p className="text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
                Arkan Protocol • V1.0 Stable
            </p>
          </footer>
        </SheetContent>
      </Sheet>
    </div>
  );
}
