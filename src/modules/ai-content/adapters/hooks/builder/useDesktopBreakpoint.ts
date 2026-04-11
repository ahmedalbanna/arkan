// hooks/builder/useDesktopBreakpoint.ts
import { useCallback, useEffect, useState } from 'react';

interface SidebarState {
    left: boolean;
    right: boolean;
}

export const useDesktopBreakpoint = () => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [sidebarState, setSidebarState] = useState<SidebarState>({ left: true, right: true });

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);

        // Load saved sidebar state from localStorage
        const savedState = localStorage.getItem('builder-sidebar-state');
        if (savedState) {
            try {
                setSidebarState(JSON.parse(savedState));
            } catch (e) {
                console.error('Failed to load sidebar state', e);
            }
        }

        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const updateSidebarState = useCallback((side: keyof SidebarState, value: boolean) => {
        setSidebarState(prev => {
            const newState = { ...prev, [side]: value };
            localStorage.setItem('builder-sidebar-state', JSON.stringify(newState));
            return newState;
        });
    }, []);

    return {
        isDesktop,
        sidebarState,
        setSidebarState: updateSidebarState,
    };
};
