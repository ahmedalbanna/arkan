import { ReactElement, ReactNode } from 'react';

export interface SidebarPanelConfig {
    key: string;
    title: string;
    icon: ReactNode;
    content: ReactNode;
    shortcut?: string;
    badge?: number;
}

export type SidebarSide = 'left' | 'right';

export interface BuilderSidebarProps {
    panels: SidebarPanelConfig[];
    activeKey: string;
    onActiveKeyChange: (key: string) => void;
    side: SidebarSide;
    width?: number;
    onWidthChange?: (width: number) => void;
    className?: string;
}
