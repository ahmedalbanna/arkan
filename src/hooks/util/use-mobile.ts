
'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // md

/**
 * A simple hook to detect if the current viewport is mobile-sized.
 * @returns A boolean indicating if the screen is mobile-sized.
 */
export function useMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // This function will only run on the client side
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        // Initial check
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    return isMobile;
}
