'use client';

import {
    BookOpen,
    Bot,
    CreditCard,
    History,
    LayoutDashboard,
    Palette,
    PencilRuler,
    Settings,
    Users
} from 'lucide-react';

export interface NavLink {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    children?: NavLink[];
}

export const navConfig: NavLink[] = [
    { href: '/admin/dashboard', labelKey: 'adminDashboard.pageTitle', icon: LayoutDashboard },
    { href: '/admin/manage-users', labelKey: 'header.manageUsers', icon: Users },
    { href: '/admin/manage-payments', labelKey: 'header.managePayments', icon: CreditCard },
    { href: '/admin/manage-agents', labelKey: 'header.agentManager', icon: Bot },
    { href: '/admin/manage-sections', labelKey: 'header.manageSections', icon: PencilRuler },
    { href: '/admin/manage-generations', labelKey: 'header.activityHistory', icon: History },
    { href: '/admin/manage-templates', labelKey: 'header.manageTemplates', icon: Palette },
    { href: '/admin/settings', labelKey: 'header.adminSettings', icon: Settings },
    { href: '/api-docs', labelKey: 'API Docs', icon: BookOpen },
];
