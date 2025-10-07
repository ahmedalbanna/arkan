'use client';

import { useEffect } from 'react';

interface WebVitalsMetric {
    name: string;
    value: number;
    delta: number;
    id: string;
    navigationType: string;
}

interface WebVitalsReport {
    metric: WebVitalsMetric;
    report: (metric: WebVitalsMetric) => void;
}

export function WebVitalsReporter() {
    useEffect(() => {
        // Only run in production
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // Dynamic import for web-vitals to reduce bundle size
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            const reportWebVitals = (metric: WebVitalsMetric) => {
                // Log to console in development
                console.log('Web Vitals:', metric);

                // Send to analytics service (you can replace this with your preferred analytics)
                if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', metric.name, {
                        event_category: 'Web Vitals',
                        event_label: metric.id,
                        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                        non_interaction: true,
                    });
                }

                // Send to custom analytics endpoint
                fetch('/api/analytics/web-vitals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: metric.name,
                        value: metric.value,
                        delta: metric.delta,
                        id: metric.id,
                        navigationType: metric.navigationType,
                        timestamp: Date.now(),
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                    }),
                }).catch((error) => {
                    console.warn('Failed to send Web Vitals to analytics:', error);
                });
            };

            // Measure Core Web Vitals
            getCLS(reportWebVitals);
            getFID(reportWebVitals);
            getFCP(reportWebVitals);
            getLCP(reportWebVitals);
            getTTFB(reportWebVitals);
        }).catch((error) => {
            console.warn('Failed to load web-vitals:', error);
        });
    }, []);

    return null; // This component doesn't render anything
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
    useEffect(() => {
        // Monitor bundle size
        if (typeof window !== 'undefined' && 'performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry as PerformanceNavigationTiming;
                        console.log('Navigation Performance:', {
                            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
                        });
                    }
                }
            });

            observer.observe({ entryTypes: ['navigation'] });

            return () => observer.disconnect();
        }
    }, []);
}

// Bundle size monitoring
export function useBundleSizeMonitoring() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            const jsResources = resources.filter(resource =>
                resource.name.includes('.js') &&
                !resource.name.includes('node_modules') &&
                resource.transferSize > 0
            );

            const totalJSSize = jsResources.reduce((total, resource) => total + resource.transferSize, 0);

            console.log('Bundle Size Analysis:', {
                totalJSSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
                jsResources: jsResources.length,
                largestResources: jsResources
                    .sort((a, b) => b.transferSize - a.transferSize)
                    .slice(0, 5)
                    .map(resource => ({
                        name: resource.name.split('/').pop(),
                        size: `${(resource.transferSize / 1024).toFixed(2)} KB`,
                    })),
            });

            // Send bundle size data to analytics
            fetch('/api/analytics/bundle-size', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    totalJSSize,
                    jsResourcesCount: jsResources.length,
                    timestamp: Date.now(),
                    url: window.location.href,
                }),
            }).catch((error) => {
                console.warn('Failed to send bundle size data:', error);
            });
        }
    }, []);
}
