
'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Menu,
  LayoutDashboard,
  Users,
  CreditCard,
  Bot,
  History,
  PencilRuler,
  Palette,
  FileImage,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLogout } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageToggle } from '@/components/LanguageToggle';

const adminNavLinks = [
    { href: '/admin/dashboard', labelKey: 'adminDashboard.pageTitle', icon: LayoutDashboard },
    { href: '/admin/manage-users', labelKey: 'header.manageUsers', icon: Users },
    { href: '/admin/manage-payments', labelKey: 'header.managePayments', icon: CreditCard },
    { href: '/admin/manage-agents', labelKey: 'header.agentManager', icon: Bot },
    { href: '/admin/manage-features', labelKey: 'header.manageFeatures', icon: SlidersHorizontal },
    { href: '/admin/manage-generations', labelKey: 'header.activityHistory', icon: History },
    { href: '/admin/manage-generation-templates', labelKey: 'Generation Templates', icon: PencilRuler },
    { href: '/admin/manage-templates', labelKey: 'header.exportTemplates', icon: Palette },
    { href: '/admin/manage-pptx-templates', labelKey: 'header.pptxTemplates', icon: FileImage },
    { href: '/admin/settings', labelKey: 'header.adminSettings', icon: Settings },
];

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { t } = useLocalization();
    const { userProfile, isLoading: isAuthLoading, firebaseUser } = useAuth();
    const logoutMutation = useLogout();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && userProfile?.role !== 'admin') {
            notFound();
        }
    }, [isAuthLoading, userProfile]);

    if (isAuthLoading || userProfile?.role !== 'admin') {
        return (
             <div className="flex h-screen w-full items-center justify-center">
                <p>Loading...</p>
             </div>
        );
    }
    
    const renderNavLinks = (isMobile = false) => adminNavLinks.map(link => (
        <Link
            key={link.href}
            href={link.href}
            onClick={() => isMobile && setIsSheetOpen(false)}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
                pathname === link.href && "bg-sidebar-accent text-sidebar-primary"
            )}
        >
            <link.icon className="h-4 w-4" />
            {t(link.labelKey)}
        </Link>
    ));

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-sidebar md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Home className="h-6 w-6" />
                            <span className="">{t('header.title')}</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                           {renderNavLinks()}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                     <Home className="h-6 w-6" />
                                    <span className="">{t('header.title')}</span>
                                </Link>
                               {renderNavLinks(true)}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="w-full flex-1" />

                    <ThemeToggle />
                    <LanguageToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={userProfile.profilePictureUrl} />
                                    <AvatarFallback>{userProfile.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{userProfile.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href={`/profile/${firebaseUser?.uid}`}>Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/generate">Go to Builder</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => logoutMutation.mutate()}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
