/**
 * Virtual Scroll Container Component
 *
 * مكون حاوية التمرير الافتراضية فائق الأداء
 */

import React, { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { useVirtualScroller } from '@/core/hooks/performance/use-virtual-scroller';

export interface VirtualScrollContainerProps<T = any> {
    /** البيانات المعروضة */
    items: T[];
    /** ارتفاع العنصر الواحد (ثابت) */
    itemHeight: number;
    /** ارتفاع الحاويَةة */
    containerHeight?: number;
    /** مكون عرض العنصر */
    renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
    /** معرف فريد للعناصر */
    getItemKey?: (item: T, index: number) => string | number;
    /** التباعد بين العناصر */
    itemSpacing?: number;
    /** Class name إضافي */
    className?: string;
    /** التخصيصات الإضافية */
    style?: React.CSSProperties;
    /** عدد العناصر المحمية */
    overscan?: number;
    /** Loading component */
    LoadingComponent?: React.ComponentType;
    /** Empty state component */
    EmptyComponent?: React.ComponentType;
    /** Footer component */
    FooterComponent?: React.ComponentType;
    /** Enable horizontal scrolling */
    horizontal?: boolean;
    /** على العناصر المحملة */
    onItemsLoad?: (visibleIndices: number[]) => void;
    /** على حدوث تغيير في المشهد */
    onViewportChange?: (viewportIndices: number[]) => void;
}

/**
 * Virtual Scroll Container المطور
 */
export const VirtualScrollContainer = forwardRef<HTMLDivElement, VirtualScrollContainerProps<any>>((
    {
        items,
        itemHeight,
        containerHeight = 400,
        renderItem,
        getItemKey,
        itemSpacing = 8,
        className = '',
        style,
        overscan = 5,
        LoadingComponent,
        EmptyComponent,
        horizontal = false,
        onItemsLoad,
        onViewportChange,
        ...props
    },
    ref
)

{

    // Refs للحاوية والعناصر
    const containerRef = useRef<HTMLDivElement>(null);
    const [actualContainerHeight, setActualContainerHeight] = useState(containerHeight);

    // استخراج مفاتيح فريدة للعناصر
    const itemKeys = useMemo(() => {
        return items.map((item, index) =>
            getItemKey ? getItemKey(item, index) : index
        );
    }, [items, getItemKey]);

    // استخدام Virtual Scroller Hook
    const {
        visibleItems,
        totalSize,
        scrollToIndex,
        scrollToTop,
        scrollToBottom,
        scrollInfo,
        viewportItems
    } = useVirtualScroller({
        itemCount: items.length,
        itemHeight: itemHeight + itemSpacing,
        containerHeight: actualContainerHeight,
        overscan,
        horizontal
    });

    // تحديث ارتفاع الحاوية
    useEffect(() => {
        if (containerRef.current && !containerHeight) {
            const height = containerRef.current.parentElement?.clientHeight || 400;
            setActualContainerHeight(height);
        }
    }, [containerHeight]);

    // التحديث عند تغيير العناصر المرئية
    useEffect(() => {
        if (visibleItems.length > 0) {
            onItemsLoad?.(visibleItems.map(item => item.index));
            onViewportChange?.(viewportItems);
        }
    }, [visibleItems, onItemsLoad, onViewportChange, viewportItems]);

    // تصميم الحاوية
    const containerStyle: React.CSSProperties = {
        height: actualContainerHeight,
        width: horizontal ? 'totalSize' : '100%',
        overflow: 'auto',
        position: 'relative',
        ...style
    };

    // تصميم العناصر المرئية
    const renderedItems = useMemo(() => {
        return visibleItems.map(({ index, top, left, height, width }) => {
            const item = items[index];
            const key = itemKeys[index];

            const itemStyle: React.CSSProperties = {
                position: 'absolute',
                top: top,
                left: horizontal ? left : 0,
                height: height - itemSpacing,
                width: horizontal ? width - itemSpacing : '100%',
                transform: 'translateZ(0)', // تسريع الرسومية
                willChange: scrollInfo.isScrolling ? 'transform' : 'auto'
            };

            return (
                <div
                    key={key}
                    data-index={index}
                    style={itemStyle}
                    className="virtual-scroll-item"
                >
                    {renderItem(item, index, itemStyle)}
                </div>
            );
        });
    }, [visibleItems, items, itemKeys, itemSpacing, horizontal, scrollInfo.isScrolling, renderItem]);

    // حالة فارغة
    if (items.length === 0 && EmptyComponent) {
        return (
            <div
                ref={containerRef || ref}
                className={`virtual-scroll-container empty ${className}`}
                style={containerStyle}
            >
                <EmptyComponent />
            </div>
        );
    }

    // عرض العناصر
    return (
        <div
            ref={containerRef || ref}
            className={`virtual-scroll-container ${className}`}
            style={containerStyle}
            {...props}
        >
            {/* Container للعناصر الافتراضية */}
            <div
                style={{
                    height: totalSize,
                    width: horizontal ? totalSize : '100%',
                    position: 'relative'
                }}
            >
                {renderedItems}

                {/* Loading overlay */}
                {LoadingComponent && (
                    <div className="virtual-scroll-loading-overlay">
                        <LoadingComponent />
                    </div>
                )}
            </div>

            {/* Scroll indicators */}
            {scrollInfo.scrollRate > 10 && (
                <div className="virtual-scroll-indicator">
                    Scrolling at {scrollInfo.scrollRate.toFixed(1)}px/ms
                </div>
            )}
        </div>
    );
});

VirtualScrollContainer.displayName = 'VirtualScrollContainer';

/**
 * Optimized List Component للمقالات الطويلة
 */
export interface OptimizedListProps<T = any> extends VirtualScrollContainerProps<T> {
    /** نوع القائمة */
    variant?: 'cards' | 'list' | 'grid';
    /** عرض العنصر المحسن */
    ItemComponent?: React.ComponentType<{ item: T; index: number; isVisible: boolean }>;
}

export const OptimizedList = forwardRef<HTMLDivElement, OptimizedListProps<any>>((
    {
        variant = 'list',
        ItemComponent,
        ...props
    },
    ref
) => {
    // إعداد عرض العنصر حسب النوع
    const renderItem = useCallback((item: any, index: number, style: React.CSSProperties) => {
        if (ItemComponent) {
            return (
                <ItemComponent
                    item={item}
                    index={index}
                    isVisible={parseInt(style.top?.toString() || '0') >= 0}
                />
            );
        }

        // عرض افتراضي حسب النوع
        switch (variant) {
            case 'cards':
                return (
                    <div style={{ ...style, backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                        <h3>{item.title || item.name || `Item ${index}`}</h3>
                        <p>{item.description || item.content || 'No description available'}</p>
                    </div>
                );

            case 'grid':
                return (
                    <div style={{ ...style, backgroundColor: '#e0e0e0', padding: '12px', borderRadius: '4px' }}>
                        <div>{item.title || item.name || `Grid Item ${index}`}</div>
                    </div>
                );

            default: // list
                return (
                    <div style={{ ...style, padding: '8px', borderBottom: '1px solid #eee' }}>
                        <div>{item.title || item.name || `List Item ${index}`}</div>
                    </div>
                );
        }
    }, [variant, ItemComponent]);

    return (
        <VirtualScrollContainer
            ref={ref}
            {...props}
            renderItem={renderItem}
        />
    );
});

OptimizedList.displayName = 'OptimizedList';

export default VirtualScrollContainer;
