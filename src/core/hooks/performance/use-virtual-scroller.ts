/**
 * Virtual Scrolling Hook متقدم
 *
 * يوفر وظائف scrolling افتراضية محسنة للمكونات الكبيرة
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface VirtualScrollerOptions {
    /** عدد العناصر المراد عرضها */
    itemCount: number;
    /** ارتفاع العنصر الواحد */
    itemHeight: number;
    /** ارتفاع الحاوية */
    containerHeight: number;
    /** عدد العناصر المحمية قبل وبعد العرض */
    overscan?: number;
    /** تحديد ما إذا كان التمرير أفقياً */
    horizontal?: boolean;
    /** معدل تحديث الموضع */
    throttleMs?: number;
}

export interface VirtualScrollerReturn {
    /** العناصر المعروضة حالياً */
    visibleItems: Array<{
        index: number;
        top: number;
        left: number;
        height: number;
        width: number;
    }>;
    /** الطول الإجمالي للمحتوى */
    totalSize: number;
    /** العناصر التي في Viewport */
    viewportItems: number[];
    /** وظائف التحكم */
    scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
    scrollToTop: () => void;
    scrollToBottom: () => void;
    /** معلومات التمرير */
    scrollInfo: {
        scrollTop: number;
        scrollLeft: number;
        scrollRate: number;
        isScrolling: boolean;
    };
    /** حالات التحميل */
    loadingStates: {
        isLoading: boolean;
        loadingCount: number;
    };
}

/**
 * Virtual Scroller فائق الأداء
 */
export function useVirtualScroller({
    itemCount,
    itemHeight,
    containerHeight,
    overscan = 5,
    horizontal = false,
    throttleMs = 16
}: VirtualScrollerOptions): VirtualScrollerReturn {
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollRate, setScrollRate] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number>();
    const lastScrollTime = useRef<number>(Date.now());
    const lastScrollPosition = useRef<number>(0);

    // حساب العناصر المرئية
    const visibleItems = useMemo(() => {
        const items: Array<{
            index: number;
            top: number;
            left: number;
            height: number;
            width: number;
        }> = [];

        if (horizontal) {
            const itemsPerRow = Math.floor(containerHeight / itemHeight);
            const itemWidth = itemHeight; // افتراض مربع
            const viewportWidth = containerRef.current?.clientWidth || containerHeight;
            const startIndex = Math.max(0, Math.floor(scrollLeft / itemWidth) - overscan);
            const endIndex = Math.min(itemCount, Math.ceil((scrollLeft + viewportWidth) / itemWidth) + overscan);

            for (let i = startIndex; i < endIndex; i++) {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;

                items.push({
                    index: i,
                    top: row * itemHeight,
                    left: col * itemWidth,
                    height: itemHeight,
                    width: itemWidth
                });
            }
        } else {
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
            const endIndex = Math.min(itemCount, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

            for (let i = startIndex; i < endIndex; i++) {
                items.push({
                    index: i,
                    top: i * itemHeight,
                    left: 0,
                    height: itemHeight,
                    width: horizontal ? itemHeight : '100%'
                });
            }
        }

        return items;
    }, [itemCount, itemHeight, containerHeight, scrollTop, scrollLeft, overscan, horizontal]);

    // حساب الطول الإجمالي
    const totalSize = useMemo(() => {
        if (horizontal) {
            const itemsPerRow = Math.floor(containerHeight / itemHeight);
            const rows = Math.ceil(itemCount / itemsPerRow);
            return rows * itemHeight;
        }
        return itemCount * itemHeight;
    }, [itemCount, itemHeight, containerHeight, horizontal]);

    // العناصر في Viewport
    const viewportItems = useMemo(() => {
        return visibleItems.map(item => item.index);
    }, [visibleItems]);

    // وظائف التمرير المحسنة
    const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
        if (horizontal) {
            const itemsPerRow = Math.floor(containerHeight / itemHeight);
            const row = Math.floor(index / itemsPerRow);
            const newScrollLeft = row * itemHeight;
            setScrollLeft(newScrollLeft);
        } else {
            let newScrollTop: number;

            switch (align) {
                case 'start':
                    newScrollTop = index * itemHeight;
                    break;
                case 'center':
                    newScrollTop = (index * itemHeight) - (containerHeight / 2);
                    break;
                case 'end':
                    newScrollTop = (index * itemHeight) - containerHeight + itemHeight;
                    break;
            }

            setScrollTop(Math.max(0, newScrollTop));
        }
    }, [itemHeight, containerHeight, horizontal]);

    const scrollToTop = useCallback(() => {
        setScrollTop(0);
        setScrollLeft(0);
    }, []);

    const scrollToBottom = useCallback(() => {
        setScrollTop(Math.max(0, totalSize - containerHeight));
    }, [totalSize, containerHeight]);

    // معالج التمرير المحسن مع Throttling
    const handleScroll = useCallback((event: Event) => {
        if (frameRef.current) return;

        frameRef.current = requestAnimationFrame(() => {
            const target = event.target as HTMLDivElement;
            const newScrollTop = target.scrollTop;
            const newScrollLeft = target.scrollLeft;

            setScrollTop(newScrollTop);
            setScrollLeft(newScrollLeft);

            // حساب معدل التمرير
            const now = Date.now();
            const timeDelta = now - lastScrollTime.current;
            const positionDelta = Math.abs(newScrollTop - lastScrollPosition.current);

            if (timeDelta > 0) {
                setScrollRate(positionDelta / timeDelta);
            }

            lastScrollTime.current = now;
            lastScrollPosition.current = newScrollTop;

            // تحديد حالة التمرير
            setIsScrolling(true);
            setTimeout(() => setIsScrolling(false), throttleMs);

            frameRef.current = 0;
        });
    }, [throttleMs]);

    // إعداد Event Listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [handleScroll]);

    return {
        visibleItems,
        totalSize,
        viewportItems,
        scrollToIndex,
        scrollToTop,
        scrollToBottom,
        scrollInfo: {
            scrollTop,
            scrollLeft,
            scrollRate,
            isScrolling
        },
        loadingStates: {
            isLoading: false,
            loadingCount: 0
        }
    };
}
