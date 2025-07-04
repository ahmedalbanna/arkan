"use client";

import Link from 'next/link';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Menu, User, Briefcase, BrainCircuit, HomeIcon, FileText, BookMarked } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'الرئيسية', icon: HomeIcon },
  { href: '/projects', label: 'المشاريع', icon: Briefcase },
  { href: '/summarize', label: 'تلخيص بالذكاء الاصطناعي', icon: BrainCircuit },
  { href: '/generate-proposal', label: 'توليد مقترح', icon: FileText },
  { href: '/generate-introduction', label: 'توليد مقدمة', icon: BookMarked },
  { href: '/profile/user-1', label: 'الملف الشخصي', icon: User },
];

export function Header() {
  const pathname = usePathname();

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
          {isMobile && <link.icon className="ml-4 h-5 w-5" />}
          {link.label}
        </Link>
      </Button>
    ));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
          أركان
        </Link>
        <nav className="hidden md:flex gap-4 mr-auto">
          {renderNavLinks()}
        </nav>
        <div className="md:hidden mr-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetTitle className="sr-only">القائمة</SheetTitle>
              <nav className="flex flex-col gap-4 pt-8">
                {renderNavLinks(true)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
