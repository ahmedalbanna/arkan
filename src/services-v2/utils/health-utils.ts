/**
 * أدوات التحقق من الصحة - Health Utils v2.0
 *
 * دوال مساعدة للتحقق من صحة الخدمات والنظام
 */

import { ServiceMonitor } from '../core/base-service';

/**
 * فحص صحة جميع الخدمات
 */
export async function checkAllServicesHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, any>;
    timestamp: Date;
}> {
    const monitor = ServiceMonitor.getInstance();

    try {
        const serviceHealth = await monitor.checkAllServices();
        const timestamp = new Date();

        // تحديد الحالة العامة
        const hasUnhealthyServices = Object.values(serviceHealth).some(
            health => health.status === 'unhealthy'
        );

        const hasDegradedServices = Object.values(serviceHealth).some(
            health => health.status === 'degraded'
        );

        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        if (hasUnhealthyServices) {
            overallStatus = 'unhealthy';
        } else if (hasDegradedServices) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            services: Object.fromEntries(serviceHealth),
            timestamp,
        };
    } catch (error) {
        console.error('Failed to check services health:', error);
        return {
            status: 'unhealthy',
            services: {},
            timestamp: new Date(),
        };
    }
}

/**
 * فحص صحة خدمة محددة
 */
export function checkServiceHealth(serviceName: string): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    lastChecked: Date;
    issues: string[];
} | null {
    const monitor = ServiceMonitor.getInstance();
    return monitor.getServiceHealth(serviceName) || null;
}

/**
 * تسجيل حالة الصحة
 */
export function logHealthStatus(status: 'healthy' | 'degraded' | 'unhealthy', details?: string): void {
    const timestamp = new Date().toISOString();
    const message = details ? `Health check: ${details}` : 'Health check completed';

    switch (status) {
        case 'healthy':
            console.log(`✅ ${timestamp} - ${message}`);
            break;
        case 'degraded':
            console.warn(`⚠️ ${timestamp} - ${message}`);
            break;
        case 'unhealthy':
            console.error(`❌ ${timestamp} - ${message}`);
            break;
    }
}
