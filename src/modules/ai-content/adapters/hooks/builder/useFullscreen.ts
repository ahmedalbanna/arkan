'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

/**
 * Hook to manage fullscreen state and actions for a target element.
 */
export function useFullscreen(containerRef: RefObject<HTMLDivElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
      });
    }
  }, [containerRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
}
