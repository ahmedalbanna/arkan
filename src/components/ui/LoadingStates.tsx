/**
 * نظام مكونات Loading متقدم مع Animation و Micro-interactions
 * يوفر مكونات Loading متنوعة وقابلة لإعادة الاستخدام لتجربة مستخدم ممتازة
 */

'use client';

import { LoadingVariant } from '@/context/LoadingContext';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

/**
 * Props مشتركة لجميع مكونات Loading
 */
export interface BaseLoadingProps {
    /** حجم المكون */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** لون المكون */
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
    /** كيفية المحاذاة */
    align?: 'left' | 'center' | 'right';
    /** إضافة طبقة شفافة خلفية */
    backdrop?: boolean;
    /** معرف فريد */
    id?: string;
    /** CSS classes إضافية */
    className?: string;
}

/**
 * خصائص Spinner المتقدمة
 */
export interface SpinnerProps extends BaseLoadingProps {
    /** سرعة الدوران */
    speed?: 'slow' | 'normal' | 'fast';
    /** هل يجب إظهار النص أسفل الـ Spinner */
    showLabel?: boolean;
    /** نص مخصص */
    label?: string;
}

/**
 * خصائص Skeleton المتقدمة
 */
export interface SkeletonProps extends BaseLoadingProps {
    /** عدد خطوط الهيكل */
    lines?: number;
    /** عرض الخطوط */
    width?: string | '1/2' | '1/3' | '1/4' | '2/3' | '3/4' | 'full';
    /** ارتفاع الخط */
    height?: 'xs' | 'sm' | 'md' | 'lg';
    /** نوع الهيكل */
    variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
}

/**
 * خصائص Progress المتقدمة
 */
export interface ProgressProps extends BaseLoadingProps {
    /** قيمة التقدم (0-100) */
    value?: number;
    /** هل يجب إظيار النسبة المئوية */
    showPercentage?: boolean;
    /** علامة تجميع الكسر */
    marker?: boolean;
    /** نوع الشريط */
    variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * خصائص Pulse المتقدمة
 */
export interface PulseProps extends BaseLoadingProps {
    /** عدد النبضات */
    count?: number;
    /** سرعة النبض */
    speed?: 'slow' | 'normal' | 'fast';
    /** نوع النبض */
    variant?: 'dots' | 'bars' | 'waves';
}

/**
 * خصائص Overlay المتقدمة
 */
export interface OverlayProps extends BaseLoadingProps {
    /** نوع Overlay */
    variant?: 'fullscreen' | 'modal' | 'inline';
    /** شفافية الخلفية */
    opacity?: number;
    /** هل يمكن النقر خلف Overlay */
    clickthrough?: boolean;
    /** إغلاق عند النقر خارج */
    closable?: boolean;
    /** حدث الإغلاق */
    onClose?: () => void;
}

/**
 * Mappings للأحجام
 */
const sizeMappings = {
    xs: { spinner: 'h-3 w-3', icon: 'h-3 w-3', text: 'text-xs' },
    sm: { spinner: 'h-4 w-4', icon: 'h-4 w-4', text: 'text-sm' },
    md: { spinner: 'h-6 w-6', icon: 'h-5 w-5', text: 'text-sm' },
    lg: { spinner: 'h-8 w-8', icon: 'h-6 w-6', text: 'text-base' },
    xl: { spinner: 'h-12 w-12', icon: 'h-8 w-8', text: 'text-lg' },
};

/**
 * Mappings للألوان
 */
const colorMappings = {
    primary: 'text-primary border-primary',
    secondary: 'text-secondary border-secondary',
    success: 'text-green-500 border-green-500',
    warning: 'text-yellow-500 border-yellow-500',
    error: 'text-red-500 border-red-500',
    gray: 'text-gray-500 border-gray-500',
};

/**
 * Mapping للسرعة
 */
const speedMappings = {
    slow: 'animate-pulse',
    normal: 'animate-spin',
    fast: 'animate-spin motion-reduce:animate-pulse',
};

/**
 * مكون Spinner متقدم مع Animation
 */
export const LoadingSpinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = 'primary',
    align = 'center',
    speed = 'normal',
    showLabel = false,
    label = 'جاري التحميل...',
    backdrop = false,
    className,
}) => {
    const [animationPhase, setAnimationPhase] = useState(0);

    const classes = {
        spinner: cn(
            'border-2 border-transparent border-t-current rounded-full',
            sizeMappings[size].spinner,
            speedMappings[speed],
            colorMappings[color].split(' ')[0], // text class only
        ),
        container: cn(
            'flex items-center gap-2',
            {
                'justify-start': align === 'left',
                'justify-center': align === 'center',
                'justify-end': align === 'right',
                'px-4 py-2': backdrop,
                'bg-background/80 backdrop-blur-sm rounded-lg': backdrop,
            },
            className,
        ),
        label: cn(
            'text-muted-foreground',
            sizeMappings[size].text,
            colorMappings[color].split(' ')[0].replace('text-', 'text-muted-'),
        ),
    };

    return (
        <div className={classes.container}>
            <div className={classes.spinner} />
            {showLabel && (
                <span className={classes.label}>
                    {label}
                </span>
            )}
        </div>
    );
};

/**
 * مكون Skeleton متقدم متعدد الأنماط
 */
export const LoadingSkeleton: React.FC<SkeletonProps> = ({
    lines = 3,
    width = 'full',
    height = 'md',
    variant = 'text',
    size = 'md',
    color = 'gray',
    align = 'left',
    className,
}) => {
    const heightClasses = {
        xs: 'h-2',
        sm: 'h-3',
        md: 'h-4',
        lg: 'h-5',
    };

    const widthClasses = {
        full: 'w-full',
        '1/2': 'w-1/2',
        '1/3': 'w-1/3',
        '1/4': 'w-1/4',
        '2/3': 'w-2/3',
        '3/4': 'w-3/4',
    };

    const variantClasses = {
        text: 'rounded',
        rectangular: '',
        circular: 'rounded-full aspect-square',
        rounded: 'rounded-lg',
    };

    const colorClass = color === 'gray' ? 'bg-gray-200 dark:bg-gray-700' :
        color === 'primary' ? 'bg-primary/20' :
            `bg-${color}-200 dark:bg-${color}-800`;

    const containerClasses = cn(
        'space-y-2',
        {
            'text-left': align === 'left',
            'text-center': align === 'center',
            'text-right': align === 'right',
        },
        className,
    );

    const skeletonClasses = cn(
        'animate-pulse',
        colorClass,
        heightClasses[height],
        typeof width === 'string' && widthClasses[width as keyof typeof widthClasses] || '',
        variantClasses[variant],
    );

    const renderSkeletonLine = (index: number) => {
        const lineWidths = ['full', '4/5', '3/4', '2/3', '1/2'];
        const lineWidth = lineWidths[index % lineWidths.length];

        return (
            <div
                key={index}
                className={cn(skeletonClasses, widthClasses[lineWidth as keyof typeof widthClasses])}
                style={typeof width === 'string' ? {} : { width }}
            />
        );
    };

    return (
        <div className={containerClasses}>
            {Array.from({ length: lines }, (_, index) => renderSkeletonLine(index))}
        </div>
    );
};

/**
 * مكون Progress متقدم مع Animation
 */
export const LoadingProgress: React.FC<ProgressProps> = ({
    value = 0,
    showPercentage = true,
    marker = false,
    variant = 'default',
    size = 'md',
    className,
}) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    const heightClasses = {
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-5',
    };

    const variantClasses = {
        default: 'bg-primary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedValue(value);
        }, 100);

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className={cn('w-full space-y-2', className)}>
            <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heightClasses[size])}>
                <div
                    className={cn(
                        'transition-all duration-500 ease-out',
                        variantClasses[variant],
                        heightClasses[size]
                    )}
                    style={{ width: `${animatedValue}%` }}
                />
                {marker && (
                    <div
                        className="h-full border-l-2 border-white dark:border-gray-800 absolute pointer-events-none"
                        style={{ left: `${value}%`, transform: 'translateX(-1px)' }}
                    />
                )}
            </div>
            {showPercentage && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>التقدم</span>
                    <span>{Math.round(animatedValue)}%</span>
                </div>
            )}
        </div>
    );
};

/**
 * مكون Pulse متقدم مع Animation متنوعة
 */
export const LoadingPulse: React.FC<PulseProps> = ({
    count = 3,
    size = 'md',
    color = 'primary',
    speed = 'normal',
    variant = 'dots',
    align = 'center',
    className,
}) => {
    const [animationPhase, setAnimationPhase] = useState(0);

    const dotSize = {
        xs: 'w-1 h-1',
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
        xl: 'w-5 h-5',
    };

    const colorClass = color === 'primary' ? 'bg-primary' :
        color === 'secondary' ? 'bg-secondary' :
            color === 'success' ? 'bg-green-500' :
                color === 'warning' ? 'bg-yellow-500' :
                    color === 'error' ? 'bg-red-500' :
                        'bg-gray-500';

    const renderDots = () => (
        <div className="flex space-x-1">
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className={cn(
                        'rounded-full animate-pulse',
                        dotSize[size],
                        colorClass,
                    )}
                    style={{
                        animationDelay: `${index * 0.15}s`,
                        animationDuration: speed === 'fast' ? '0.8s' : speed === 'slow' ? '2s' : '1.2s'
                    }}
                />
            ))}
        </div>
    );

    const renderBars = () => (
        <div className="flex space-x-1">
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className={cn(
                        'animate-pulse rounded',
                        dotSize[size].replace('w-', 'w-2'),
                        colorClass,
                    )}
                    style={{
                        animationDelay: `${index * 0.1}s`,
                        animationDuration: speed === 'fast' ? '0.6s' : speed === 'slow' ? '1.8s' : '1s'
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className={cn(
            'flex items-center gap-2',
            {
                'justify-start': align === 'left',
                'justify-center': align === 'center',
                'justify-end': align === 'right',
            },
            className,
        )}>
            {variant === 'dots' && renderDots()}
            {variant === 'bars' && renderBars()}
        </div>
    );
};

/** مكون Overlay متقدم */
export const LoadingOverlay: React.FC<OverlayProps & { children?: React.ReactNode }> = ({
    variant = 'fullscreen',
    opacity = 0.5,
    clickthrough = false,
    closable = false,
    onClose,
    children,
    className,
}) => {
    const overlayClasses = {
        fullscreen: 'fixed inset-0 z-50',
        modal: 'absolute inset-0 z-40',
        inline: 'relative z-10',
    };

    return (
        <div className={overlayClasses[variant]}>
            {!clickthrough && (
                <div
                    className={cn(
                        'inset-0 bg-background/80 backdrop-blur-sm',
                        overlayClasses[variant],
                    )}
                    style={{ opacity }}
                    onClick={closable ? onClose : undefined}
                />
            )}
            <div className={cn(
                'flex items-center justify-center h-full',
                className,
            )}>
                {children || <LoadingSpinner size="lg" showLabel label="جاري المعالجة..." />}
            </div>
        </div>
    );
};

/**
 * مكون LoadingIndicator شامل يجمع كل الأنواع
 */
export interface LoadingIndicatorProps extends BaseLoadingProps {
    /** نوع المؤشر */
    variant: LoadingVariant;
    /** خصائص مخصصة حسب النوع */
    customProps?: Partial<SpinnerProps & SkeletonProps & ProgressProps & PulseProps & OverlayProps>;
    /** رسالة التحميل */
    message?: string;
    /** قيمة التقدم */
    progress?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    variant,
    size = 'md',
    color = 'primary',
    align = 'center',
    backdrop = false,
    className,
    message,
    progress,
    customProps = {},
}) => {
    const commonProps = {
        size,
        color,
        align,
        backdrop,
        className,
        ...customProps,
        ...(variant === 'spinner' && {
            showLabel: !!message,
            label: message,
        }),
        ...(variant === 'progress' && {
            value: progress,
            showPercentage: true,
        }),
        ...(variant === 'overlay' && {
            children: message ? (
                <LoadingSpinner size="lg" showLabel label={message} />
            ) : <LoadingSpinner size="lg" />
        }),
    };

    switch (variant) {
        case 'spinner':
            return <LoadingSpinner {...(commonProps as SpinnerProps)} />;
        case 'skeleton':
            return <LoadingSkeleton {...(commonProps as SkeletonProps)} />;
        case 'progress':
            return <LoadingProgress {...(commonProps as ProgressProps)} />;
        case 'pulse':
            return <LoadingPulse {...(commonProps as PulseProps)} />;
        case 'overlay':
            return <LoadingOverlay {...(commonProps as any)} />;
        default:
            return <LoadingSpinner {...(commonProps as SpinnerProps)} />;
    }
};

export default LoadingIndicator;
