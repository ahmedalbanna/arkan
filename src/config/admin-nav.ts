'use client';

import {
    Activity,
    BookOpen,
    Bot,
    CreditCard,
    History,
    Layers,
    LayoutDashboard,
    MessageSquare,
    Palette,
    PencilRuler,
    PenSquare,
    Settings,
    SlidersHorizontal,
    TestTube,
    Upload,
    Users,
    Workflow,
    Wrench,
} from 'lucide-react';

export interface NavLink {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    children?: NavLink[];
}

export const navConfig: NavLink[] = [
    { href: '/admin/dashboard', labelKey: 'adminDashboard.pageTitle', icon: LayoutDashboard },
    { href: '/admin/rag-monitor', labelKey: 'RAG Monitor', icon: Activity },
    { href: '/admin/document-indexer', labelKey: 'Document Indexer', icon: Upload },
    { href: '/admin/rag-tester', labelKey: 'RAG Query Tester', icon: TestTube },
    { href: '/admin/flow-builder', labelKey: 'admin.flows.title', icon: Layers },
    { href: '/admin/prompts', labelKey: 'admin.prompts.title', icon: MessageSquare },
    { href: '/admin/tools', labelKey: 'admin.tools.title', icon: Wrench },
    { href: '/admin/manage-users', labelKey: 'header.manageUsers', icon: Users },
    { href: '/admin/manage-payments', labelKey: 'header.managePayments', icon: CreditCard },
    { href: '/admin/manage-agents', labelKey: 'header.agentManager', icon: Bot },
    { href: '/admin/manage-sections', labelKey: 'header.manageSections', icon: PencilRuler },
    { href: '/admin/manage-features', labelKey: 'header.manageFeatures', icon: SlidersHorizontal },
    { href: '/admin/manage-generations', labelKey: 'header.activityHistory', icon: History },
    { href: '/admin/automations/builder', labelKey: 'header.automations', icon: Workflow },
    { href: '/admin/writing-tools', labelKey: 'writingTools.pageTitle', icon: PenSquare },
    { href: '/admin/manage-templates', labelKey: 'header.manageTemplates', icon: Palette },
    { href: '/admin/settings', labelKey: 'header.adminSettings', icon: Settings },
    { href: '/api-docs', labelKey: 'API Docs', icon: BookOpen },
];
