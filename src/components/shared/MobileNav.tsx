
'use client';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, LayoutDashboard, Users, CreditCard, Bot, History, PencilRuler, Palette, Settings, SlidersHorizontal } from 'lucide-react';
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
      .map((link) => (
        <Button
          key={link.href}
          asChild
          variant={pathname.startsWith(link.href) && link.href !== '/' || pathname === '/' && link.href === '/' ? 'secondary' : 'ghost'}
          className={cn('font-headline', isMobile && 'w-full justify-start text-lg py-6')}
          onClick={isMobile ? handleLinkClick : undefined}
        >
          <Link href={link.href}>
            {isMobile && <link.icon className="ml-4 rtl:ml-0 rtl:mr-4 h-5 w-5" />}
            {t(link.label)}
          </Link>
        </Button>
      ));
  }
  
  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t('header.openMenu')}>
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-full max-w-sm flex flex-col">
          <SheetTitle className="sr-only">{t('header.openMenu')}</SheetTitle>
          <ScrollArea className="flex-grow mt-8">
            <nav className="flex flex-col gap-4 pr-6">
              {renderLinks(navLinks, true)}
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
                        {t(link.labelKey)}
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
  );
}
