import { useCallback, useEffect, useState } from 'react';

interface SidebarState {
    left: boolean;
    right: boolean;
}

interface SidebarWidths {
    left: number;
    right: number;
}

const DEFAULT_WIDTHS: SidebarWidths = { left: 320, right: 400 };
const STORAGE_KEY_STATE = 'builder-sidebar-state';
const STORAGE_KEY_WIDTHS = 'builder-sidebar-widths';

/**
 * useSidebarState — Manages sidebar visibility and width persistence.
 * Desktop-only. No breakpoint detection needed.
 */
export const useDesktopBreakpoint = () => {
    const [sidebarState, setSidebarState] = useState<SidebarState>({ left: true, right: true });
    const [sidebarWidths, setSidebarWidths] = useState<SidebarWidths>(DEFAULT_WIDTHS);

    // Load saved state from localStorage
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY_STATE);
            if (savedState) setSidebarState(JSON.parse(savedState));

            const savedWidths = localStorage.getItem(STORAGE_KEY_WIDTHS);
            if (savedWidths) setSidebarWidths(JSON.parse(savedWidths));
        } catch {
            // Ignore parse errors, use defaults
        }
    }, []);

    const updateSidebarState = useCallback((side: keyof SidebarState, value: boolean) => {
        setSidebarState(prev => {
            const newState = { ...prev, [side]: value };
            localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(newState));
            return newState;
        });
    }, []);

    const updateSidebarWidth = useCallback((side: keyof SidebarWidths, width: number) => {
        setSidebarWidths(prev => {
            const newWidths = { ...prev, [side]: width };
            localStorage.setItem(STORAGE_KEY_WIDTHS, JSON.stringify(newWidths));
            return newWidths;
        });
    }, []);

    return {
        sidebarState,
        setSidebarState: updateSidebarState,
        sidebarWidths,
        setSidebarWidth: updateSidebarWidth,
    };
};
