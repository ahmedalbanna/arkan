
'use client';

import Link from 'next/link';
import {
  Menu,
  Home,
  ChevronDown,
  BookOpenText,
  LogOut,
  User,
  Layout,
  Settings,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/infrastructure/utils/cn';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useLogout } from '@/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { navConfig, type NavLink } from '@/config/admin-nav';
import { Badge } from '@/components/ui/badge';

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

    const renderLink = (link: NavLink) => {
        const isActive = (pathname.startsWith(link.href) && link.href !== '/') || (pathname === '/' && link.href === '/');

        return (
            <Link
                key={link.href}
                href={link.href}
                onClick={() => isMobile && closeSheet && closeSheet()}
                className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
            >
                <link.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-primary/60")} />
                {t(link.labelKey)}
            </Link>
        );
    };

    const renderCollapsible = (link: NavLink) => {
        const isOpen = link.children?.some(child => pathname.startsWith(child.href)) ?? false;
        return (
            <Collapsible key={link.labelKey} defaultOpen={isOpen} className="space-y-1">
                <CollapsibleTrigger className={cn(
                    "flex items-center justify-between w-full rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                    "text-muted-foreground hover:text-primary hover:bg-primary/5 [&[data-state=open]>svg:last-child]:rotate-180"
                )}>
                    <div className="flex items-center gap-3">
                        <link.icon className="h-4 w-4 text-primary/60" />
                        <span>{t(link.labelKey)}</span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-300" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1 mt-1 border-l border-border/40 ml-6 animate-in slide-in-from-left-2 duration-300">
                    {link.children?.map(child => renderLink(child))}
                </CollapsibleContent>
            </Collapsible>
        )
    };

    return (
        <nav className="flex flex-col gap-2 px-4 py-6">
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 px-4">System Console</div>
            {navConfig.map(link => (
                link.children ? renderCollapsible(link) : renderLink(link)
            ))}
        </nav>
    );
}


function AdminLayoutContent({ children }: { children: ReactNode }) {
    const { t } = useLocalization();
    const { userProfile, isLoading: isAuthLoading, user } = useAuth();
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
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr] bg-background overflow-hidden relative">
            {/* Immersive Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <aside className="hidden border-r bg-sidebar md:block relative z-10">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <header className="flex h-16 items-center border-b px-6 lg:h-[70px]">
                         <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <BookOpenText className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-headline text-base font-bold tracking-tight text-sidebar-foreground leading-none">
                                    {t('header.title')}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 mt-1 leading-none">
                                    Admin Console
                                </span>
                            </div>
                        </Link>
                    </header>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <NavContent closeSheet={() => setIsSheetOpen(false)} />
                    </div>

                    <footer className="p-4 border-t bg-muted/5 mt-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => logoutMutation.mutate()}
                        >
                            <LogOut className="h-4 w-4" />
                            Terminate Session
                        </Button>
                    </footer>
                </div>
            </aside>

            <div className="flex flex-col relative z-10">
                <header className="flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-6 lg:h-[70px]">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden" aria-label="Toggle navigation menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 border-r-0">
                           <NavContent isMobile={true} closeSheet={() => setIsSheetOpen(false)} />
                        </SheetContent>
                    </Sheet>

                    <div className="w-full flex-1 flex items-center gap-2">
                        <Badge variant="outline" className="h-6 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5 hidden sm:flex">
                            System Node Active
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40 shadow-inner">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>

                    <div className="h-6 w-px bg-border/40 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 gap-3 px-2 rounded-xl hover:bg-muted/50 transition-all">
                                <div className="flex flex-col items-end hidden lg:flex">
                                    <span className="text-[11px] font-bold leading-none">{userProfile.name}</span>
                                    <span className="text-[9px] font-medium uppercase text-muted-foreground tracking-tighter mt-1">Super Admin</span>
                                </div>
                                <Avatar className="h-8 w-8 rounded-lg shadow-sm border border-border/40">
                                    <AvatarImage src={userProfile.profilePictureUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{userProfile.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-2xl border-border/40">
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">Account Management</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="gap-3 cursor-pointer py-2.5">
                                <Link href={`/profile/${user?.uid}`} className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-primary/60" />
                                    <span className="text-xs font-semibold">User Identity</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="gap-3 cursor-pointer py-2.5">
                                <Link href="/builder" className="flex items-center gap-3">
                                    <Layout className="h-4 w-4 text-primary/60" />
                                    <span className="text-xs font-semibold">Document Builder</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="gap-3 cursor-pointer py-2.5">
                                <Link href="/writing-tools" className="flex items-center gap-3">
                                    <Settings className="h-4 w-4 text-primary/60" />
                                    <span className="text-xs font-semibold">System Tools</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="gap-3 cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/5">
                                <LogOut className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-6 p-6 lg:p-10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0f172a] pointer-events-none opacity-[0.03]" />
                    <div className="relative z-10 h-full mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
