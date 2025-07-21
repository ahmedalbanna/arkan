
'use client';

import { useAuth } from "@/context/AuthContext";
import { notFound } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Bot, CreditCard, History, LayoutDashboard, Palette, FileImage, Users, SlidersHorizontal, Settings, PencilRuler, BookOpenCheck } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { 
    Sidebar, 
    SidebarProvider, 
    SidebarTrigger, 
    SidebarInset,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const { userProfile, isLoading: isAuthLoading } = useAuth();
    const { t } = useLocalization();

    const adminNavLinks = [
        { href: '/admin/dashboard', label: t('adminDashboard.pageTitle'), icon: LayoutDashboard },
        { href: '/admin/manage-users', label: t('header.manageUsers'), icon: Users },
        { href: '/admin/manage-features', label: t('header.manageFeatures'), icon: SlidersHorizontal },
        { href: '/admin/manage-agents', label: t('header.agentManager'), icon: Bot },
        { href: '/admin/manage-payments', label: t('header.managePayments'), icon: CreditCard },
        { href: '/admin/manage-generations', label: t('header.activityHistory'), icon: History },
        { href: '/admin/manage-generation-templates', label: 'Generation Templates', icon: PencilRuler },
        { href: '/admin/manage-templates', label: t('header.exportTemplates'), icon: Palette },
        { href: '/admin/manage-pptx-templates', label: t('header.pptxTemplates'), icon: FileImage },
        { href: '/admin/settings', label: t('header.adminSettings'), icon: Settings },
    ];
    
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

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                         <BookOpenCheck className="size-6 text-primary"/>
                        <span className="text-lg font-headline font-semibold">Arkan Admin</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {adminNavLinks.map(link => (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton href={link.href} tooltip={link.label}>
                                    <link.icon />
                                    <span>{link.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarFooter className="flex items-center justify-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:py-2">
                    <ThemeToggle />
                    <LanguageToggle />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
                    <SidebarTrigger className="md:hidden"/>
                    <h1 className="flex-1 text-lg font-semibold md:text-2xl">Admin Panel</h1>
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
