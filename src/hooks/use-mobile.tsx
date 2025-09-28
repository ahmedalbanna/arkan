// code explantion in docs/hooks/use-mobile.md

import { createUIHook } from '@/core';
import * as React from "react";

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1200

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [])

  return isMobile; // Return boolean or undefined during SSR
}

/**
 * Hook محسن للاستجابة مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useResponsive() {
  const uiHook = createUIHook({
    hookName: 'responsive',
    initialState: {
      isMobile: undefined,
      isTablet: undefined,
      isDesktop: undefined,
      screenWidth: undefined,
      screenHeight: undefined,
      orientation: 'portrait',
      deviceType: 'unknown',
    },
    customLogic: (state, setState, toast) => {
      const updateScreenInfo = () => {
        if (typeof window === 'undefined') return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width < MOBILE_BREAKPOINT;
        const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
        const isDesktop = width >= DESKTOP_BREAKPOINT;
        const orientation = width > height ? 'landscape' : 'portrait';

        let deviceType = 'unknown';
        if (isMobile) deviceType = 'mobile';
        else if (isTablet) deviceType = 'tablet';
        else if (isDesktop) deviceType = 'desktop';

        setState(prev => ({
          ...prev,
          isMobile,
          isTablet,
          isDesktop,
          screenWidth: width,
          screenHeight: height,
          orientation,
          deviceType,
        }));
      };

      const handleResize = () => {
        updateScreenInfo();
      };

      const handleOrientationChange = () => {
        setTimeout(updateScreenInfo, 100); // Small delay to ensure accurate measurements
      };

      const getBreakpoint = () => {
        if (state.screenWidth === undefined) return 'unknown';
        if (state.screenWidth < MOBILE_BREAKPOINT) return 'mobile';
        if (state.screenWidth < TABLET_BREAKPOINT) return 'tablet';
        if (state.screenWidth < DESKTOP_BREAKPOINT) return 'desktop';
        return 'large-desktop';
      };

      const isBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop') => {
        return getBreakpoint() === breakpoint;
      };

      const isAboveBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop') => {
        const current = getBreakpoint();
        const breakpoints = ['mobile', 'tablet', 'desktop', 'large-desktop'];
        const currentIndex = breakpoints.indexOf(current);
        const targetIndex = breakpoints.indexOf(breakpoint);
        return currentIndex > targetIndex;
      };

      const isBelowBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop') => {
        const current = getBreakpoint();
        const breakpoints = ['mobile', 'tablet', 'desktop', 'large-desktop'];
        const currentIndex = breakpoints.indexOf(current);
        const targetIndex = breakpoints.indexOf(breakpoint);
        return currentIndex < targetIndex;
      };

      return {
        updateScreenInfo,
        handleResize,
        handleOrientationChange,
        getBreakpoint,
        isBreakpoint,
        isAboveBreakpoint,
        isBelowBreakpoint,
        isMobile: state.isMobile,
        isTablet: state.isTablet,
        isDesktop: state.isDesktop,
        screenWidth: state.screenWidth,
        screenHeight: state.screenHeight,
        orientation: state.orientation,
        deviceType: state.deviceType,
      };
    }
  })();

  // Initialize screen info on mount
  React.useEffect(() => {
    uiHook.updateScreenInfo();

    window.addEventListener("resize", uiHook.handleResize);
    window.addEventListener("orientationchange", uiHook.handleOrientationChange);

    return () => {
      window.removeEventListener("resize", uiHook.handleResize);
      window.removeEventListener("orientationchange", uiHook.handleOrientationChange);
    };
  }, []);

  return {
    // الوظائف الأساسية
    isMobile: uiHook.isMobile,

    // الوظائف الجديدة من UI Hook
    ...uiHook,
  };
}
