
'use client';

import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatedContainer } from '@/components/ui/animation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useLogout } from '@/hooks';
import { cn } from '@/lib/utils';
import {
    BookTypeIcon,
    Bot,
    ChevronDown,
    CreditCard,
    History,
    Home,
    LayoutDashboard,
    Menu,
    MessageSquare,
    Settings,
    SlidersHorizontal,
    Users,
    Workflow
} from 'lucide-react';
import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface NavLink {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    children?: NavLink[];
}

const navConfig: NavLink[] = [
    { href: '/admin/dashboard', labelKey: 'adminDashboard.pageTitle', icon: LayoutDashboard },
    { href: '/admin/chats', labelKey: 'header.chats', icon: MessageSquare },
    { href: '/admin/manage-users', labelKey: 'header.manageUsers', icon: Users },
    { href: '/admin/manage-payments', labelKey: 'header.managePayments', icon: CreditCard },
    { href: '/admin/manage-agents', labelKey: 'header.agentManager', icon: Bot },
    { href: '/admin/manage-sections', labelKey: 'header.manageSections', icon: BookTypeIcon },
    { href: '/admin/manage-features', labelKey: 'header.manageFeatures', icon: SlidersHorizontal },
    { href: '/admin/manage-generations', labelKey: 'header.activityHistory', icon: History },
    { href: '/admin/automations/builder', labelKey: 'header.automations', icon: Workflow },
    { href: '/admin/settings', labelKey: 'header.adminSettings', icon: Settings },
];

function AdminLayoutSkeleton() {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-r bg-sidebar md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <header className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Skeleton className="h-6 w-32" />
                    </header>
                    <nav className="flex-1 p-4 space-y-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                        ))}
                    </nav>
                </div>
            </aside>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                    <Skeleton className="h-8 w-8 md:hidden" />
                    <div className="w-full flex-1" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </main>
            </div>
        </div>
    );
}

function NavContent({ isMobile = false, closeSheet }: { isMobile?: boolean, closeSheet?: () => void }) {
    const { t } = useLocalization();
    const pathname = usePathname();

    const renderLink = (link: NavLink) => (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <Link
                key={link.href}
                href={link.href}
                onClick={() => isMobile && closeSheet && closeSheet()}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:shadow-soft hover:scale-105 group",
                    pathname.startsWith(link.href) && link.href !== '/' && "bg-sidebar-accent text-sidebar-primary shadow-glow",
                    pathname === '/' && link.href === '/' && "bg-sidebar-accent text-sidebar-primary shadow-glow"
                )}
            >
                <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {t(link.labelKey)}
            </Link>
        </AnimatedContainer>
    );

    const renderCollapsible = (link: NavLink) => {
        const isOpen = link.children?.some(child => pathname.startsWith(child.href)) ?? false;
        return (
            <AnimatedContainer key={link.labelKey} animation="fade-in-up" delay={100}>
                <Collapsible defaultOpen={isOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:shadow-soft hover:scale-105 group [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center gap-3">
                            <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span>{t(link.labelKey)}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-7 space-y-1 mt-1">
                        {link.children?.map(child => renderLink(child))}
                    </CollapsibleContent>
                </Collapsible>
            </AnimatedContainer>
        )
    };

    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navConfig.map(link => (
                link.children ? renderCollapsible(link) : renderLink(link)
            ))}
        </nav>
    );
}


function AdminLayoutContent({ children }: { children: ReactNode }) {
    const { t } = useLocalization();
    const { userProfile, isLoading: isAuthLoading, firebaseUser } = useAuth();
    const logoutMutation = useLogout();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && userProfile?.role !== 'admin') {
            notFound();
        }
    }, [isAuthLoading, userProfile]);

    if (isAuthLoading || !userProfile || userProfile.role !== 'admin') {
        return <AdminLayoutSkeleton />;
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-r bg-sidebar md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <header className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-gradient-to-r from-sidebar to-sidebar/80 backdrop-blur-md">
                        <AnimatedContainer animation="fade-in-down" delay={200}>
                            <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors group">
                                <div className="p-1 rounded-md bg-gradient-to-br from-primary to-primary-600 group-hover:scale-110 transition-transform">
                                    <Home className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-headline">{t('header.title')}</span>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    Admin
                                </Badge>
                            </Link>
                        </AnimatedContainer>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        <NavContent closeSheet={() => setIsSheetOpen(false)} />
                    </div>
                </div>
            </aside>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:h-[60px] lg:px-6 shadow-soft">
                    <AnimatedContainer animation="fade-in-left" delay={200}>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 md:hidden hover:shadow-soft transition-all duration-200" aria-label="Toggle navigation menu">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col backdrop-blur-md">
                                <NavContent isMobile={true} closeSheet={() => setIsSheetOpen(false)} />
                            </SheetContent>
                        </Sheet>
                    </AnimatedContainer>

                    <div className="w-full flex-1" />

                    <AnimatedContainer animation="fade-in-up" delay={300}>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <LanguageToggle />
                        </div>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-right" delay={400}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full hover:shadow-glow transition-all duration-200 group" aria-label="Toggle user menu">
                                    <Avatar className="group-hover:scale-110 transition-transform">
                                        <AvatarImage src={userProfile.profilePictureUrl} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold">
                                            {userProfile.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="backdrop-blur-md">
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-gradient-to-br from-primary to-primary-600">
                                        <Users className="h-3 w-3 text-white" />
                                    </div>
                                    {userProfile.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="hover:bg-primary/5">
                                    <Link href={`/profile/${firebaseUser?.uid}`}>Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="hover:bg-primary/5">
                                    <Link href="/generate">Go to Builder</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="hover:bg-destructive/10 hover:text-destructive">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </AnimatedContainer>
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
