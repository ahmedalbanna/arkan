/**
 * مكون مراقبة الأداء محسن
 * يوفر مراقبة شاملة لأداء التطبيق
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  interval?: number;
}

/**
 * مكون مراقبة الأداء
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onMetricsUpdate,
  interval = 5000
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleSize: 0,
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  const updateMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      bundleSize: performance.getEntriesByType('navigation')[0]?.transferSize || 0,
      loadTime: performance.getEntriesByType('navigation')[0]?.loadEventEnd - performance.getEntriesByType('navigation')[0]?.loadEventStart || 0,
      renderTime: performance.getEntriesByType('measure').reduce((acc, entry) => acc + entry.duration, 0),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      networkRequests: performance.getEntriesByType('resource').length,
      cacheHitRate: performance.getEntriesByType('resource').filter(entry => entry.transferSize === 0).length / performance.getEntriesByType('resource').length * 100 || 0
    };

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);
  }, [onMetricsUpdate]);

  useEffect(() => {
    const timer = setInterval(updateMetrics, interval);
    updateMetrics();

    return () => clearInterval(timer);
  }, [updateMetrics, interval]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms.toFixed(2)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90"
      >
        <Activity className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">مراقبة الأداء</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">حجم الحزمة</span>
          </div>
          <span className="text-sm font-mono">{formatBytes(metrics.bundleSize)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm">وقت التحميل</span>
          </div>
          <span className="text-sm font-mono">{formatTime(metrics.loadTime)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm">وقت العرض</span>
          </div>
          <span className="text-sm font-mono">{formatTime(metrics.renderTime)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <span className="text-sm">استخدام الذاكرة</span>
          </div>
          <span className="text-sm font-mono">{formatBytes(metrics.memoryUsage)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm">طلبات الشبكة</span>
          </div>
          <span className="text-sm font-mono">{metrics.networkRequests}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-cyan-500" />
            <span className="text-sm">معدل التخزين المؤقت</span>
          </div>
          <span className="text-sm font-mono">{metrics.cacheHitRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
