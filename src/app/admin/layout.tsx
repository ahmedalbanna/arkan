
'use client';

import { useAuth } from "@/context/AuthContext";
import { notFound, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bot, CreditCard, History, LayoutDashboard, Palette, FileImage, Users, SlidersHorizontal, Settings, PencilRuler } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

function AdminLayoutSkeleton() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
            </header>
            <div className="border-b mb-6">
                <div className="flex items-center gap-4 px-4 sm:px-0">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div>
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const { userProfile, isLoading: isAuthLoading } = useAuth();
    const pathname = usePathname();
    const { t } = useLocalization();

    const adminNavLinks = [
        { href: '/admin/dashboard', label: t('adminDashboard.pageTitle'), icon: LayoutDashboard },
        { href: '/manage-users', label: t('header.manageUsers'), icon: Users },
        { href: '/manage-features', label: t('header.manageFeatures'), icon: SlidersHorizontal },
        { href: '/manage-agents', label: t('header.agentManager'), icon: Bot },
        { href: '/manage-payments', label: t('header.managePayments'), icon: CreditCard },
        { href: '/manage-generations', label: t('header.activityHistory'), icon: History },
        { href: '/admin/manage-generation-templates', label: 'Generation Templates', icon: PencilRuler },
        { href: '/admin/manage-templates', label: t('header.exportTemplates'), icon: Palette },
        { href: '/manage-pptx-templates', label: t('header.pptxTemplates'), icon: FileImage },
        { href: '/admin/settings', label: t('header.adminSettings'), icon: Settings },
    ];
    
    // Once loading is finished, check the role.
    useEffect(() => {
        if (!isAuthLoading && userProfile?.role !== 'admin') {
            notFound();
        }
    }, [isAuthLoading, userProfile]);

    // Show skeleton while auth state is being determined.
    if (isAuthLoading) {
        return <AdminLayoutSkeleton />;
    }

    // After loading, if the user is an admin, render the layout.
    // If not, the useEffect above will have already triggered a `notFound`.
    return userProfile?.role === 'admin' ? (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-headline font-bold text-primary">Admin Control Panel</h1>
                <p className="text-muted-foreground">Manage your application from this central hub.</p>
            </header>
            
             <div className="border-b mb-6">
                <nav className="flex items-center gap-2 sm:gap-4 -mb-px overflow-x-auto">
                    {adminNavLinks.map(link => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm whitespace-nowrap",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            
            <main>{children}</main>
        </div>
    ) : null; // Return null while waiting for the redirect from useEffect
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
