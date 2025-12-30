'use client';

import {
    LayoutDashboard,
    Users,
    CreditCard,
    Bot,
    PencilRuler,
    SlidersHorizontal,
    History,
    Workflow,
    Settings,
    PenSquare,
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
    { href: '/admin/manage-features', labelKey: 'header.manageFeatures', icon: SlidersHorizontal },
    { href: '/admin/manage-generations', labelKey: 'header.activityHistory', icon: History },
    { href: '/admin/automations/builder', labelKey: 'header.automations', icon: Workflow },
    { href: '/admin/writing-tools', labelKey: 'writingTools.pageTitle', icon: PenSquare },
    { href: '/admin/settings', labelKey: 'header.adminSettings', icon: Settings },
];
