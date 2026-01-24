'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Hook for managing scroll-to-top functionality
 */
export const useScrollToTop = (elementRef: React.RefObject<HTMLDivElement>) => {
  const scrollToTop = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [elementRef]);

  return { scrollToTop };
};

/**
 * Hook for detecting if content is scrollable
 */
export const useIsScrollable = (elementRef: React.RefObject<HTMLDivElement>) => {
  const [isScrollable, setIsScrollable] = React.useState(false);
  const [scrollPosition, setScrollPosition] = React.useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkScrollable = () => {
      const hasVerticalScroll = element.scrollHeight > element.clientHeight;
      setIsScrollable(hasVerticalScroll);
    };

    checkScrollable();

    const handleScroll = () => {
      setScrollPosition(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollable);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [elementRef]);

  return { isScrollable, scrollPosition };
};

/**
 * Hook for smooth scroll into view
 */
export const useSmoothScroll = () => {
  const smoothScrollToElement = useCallback((element: HTMLElement, container: HTMLElement) => {
    if (!element || !container) return;

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Check if element is already visible
    if (
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom
    ) {
      return;
    }

    // Scroll to make element visible with padding
    const scrollTop = container.scrollTop;
    const offsetTop = element.offsetTop - container.offsetTop;
    const targetScroll = offsetTop - (containerRect.height / 2) + (element.offsetHeight / 2);

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, []);

  return { smoothScrollToElement };
};

/**
 * ScrollToTopButton Component
 * Displays a button to scroll to top when content is scrolled down
 */
interface ScrollToTopButtonProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const ScrollToTopButton = React.forwardRef<
  HTMLButtonElement,
  ScrollToTopButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ containerRef, className, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsVisible(container.scrollTop > 200);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const handleClick = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        'fixed bottom-24 right-4 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 z-40',
        className
      )}
      aria-label="Scroll to top"
      {...props}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
});

ScrollToTopButton.displayName = 'ScrollToTopButton';

/**
 * ScrollIndicator Component
 * Shows visual indicator of scroll position
 */
interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const ScrollIndicator = React.forwardRef<
  HTMLDivElement,
  ScrollIndicatorProps
>(({ containerRef, className }, ref) => {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const scrolled = container.scrollTop;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return (
    <div
      ref={ref}
      className={cn('absolute top-0 left-0 h-1 bg-primary transition-all duration-150', className)}
      style={{ width: `${scrollProgress}%` }}
      aria-hidden="true"
    />
  );
});

ScrollIndicator.displayName = 'ScrollIndicator';

/**
 * Virtual Scroll Container Component
 * Optimizes rendering of long lists with scroll virtualization
 */
interface VirtualScrollContainerProps {
  items: any[];
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  containerClassName?: string;
  overscan?: number;
}

export const VirtualScrollContainer = React.forwardRef<
  HTMLDivElement,
  VirtualScrollContainerProps
>(({ items, itemHeight, renderItem, containerClassName, overscan = 3 }, ref) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={ref}
      className={cn('relative overflow-y-auto scroll-smooth', containerClassName)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualScrollContainer.displayName = 'VirtualScrollContainer';
