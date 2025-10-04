/**
 * مكون صورة محسن للأداء
 * يوفر تحسين الصور مع Lazy Loading و WebP/AVIF
 */

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    fill?: boolean;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * مكون صورة محسن مع Lazy Loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 75,
    placeholder = 'blur',
    blurDataURL,
    sizes,
    fill = false,
    style,
    onLoad,
    onError,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (priority || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority, isInView]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
                style={{ width, height, ...style }}
            >
                <span className="text-sm">خطأ في تحميل الصورة</span>
            </div>
        );
    }

    return (
        <div ref={imgRef} className={`relative ${className}`} style={style}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}

            {isInView && (
                <Image
                    src={src}
                    alt={alt}
                    width={fill ? undefined : width}
                    height={fill ? undefined : height}
                    fill={fill}
                    priority={priority}
                    quality={quality}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL}
                    sizes={sizes}
                    className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    );
};

/**
 * مكون صورة مع تحسينات إضافية
 */
export const AdvancedOptimizedImage: React.FC<OptimizedImageProps & {
    fallbackSrc?: string;
    retryCount?: number;
    maxRetries?: number;
}> = ({
    src,
    alt,
    fallbackSrc,
    retryCount = 0,
    maxRetries = 3,
    ...props
}) => {
        const [currentSrc, setCurrentSrc] = useState(src);
        const [retries, setRetries] = useState(retryCount);

        const handleError = () => {
            if (retries < maxRetries) {
                setRetries(prev => prev + 1);
                setCurrentSrc(`${src}?retry=${retries + 1}`);
            } else if (fallbackSrc && currentSrc !== fallbackSrc) {
                setCurrentSrc(fallbackSrc);
            }
            props.onError?.();
        };

        return (
            <OptimizedImage
                {...props}
                src={currentSrc}
                alt={alt}
                onError={handleError}
            />
        );
    };

export default OptimizedImage;
