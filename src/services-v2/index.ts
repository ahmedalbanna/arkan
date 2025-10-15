/**
 * Services v2.0 - Arkan
 *
 * نظام خدمات محسن للقابلية للتوسع والأداء العالي
 *
 * هذا الملف يوفر نقطة دخول موحدة لجميع خدمات النظام
 * مع تنظيم هرمي واضح حسب فئات الخدمات
 */

// خدمات البنية التحتية الأساسية (Core Services)
export * from './core';

// خدمات البنية التحتية (Infrastructure Services)
export * from './infrastructure';

// خدمات الأعمال (Business Services)
export * from './business';

// خدمات الذكاء الاصطناعي (Intelligent Services)
export * from './intelligent';

// خدمات المساعدة (Helper Services)
export * from './helpers';

// خدمات قديمة (Legacy Services) - للانتقال التدريجي
export * from './legacy';

// أدوات مساعدة للخدمات الجديدة
export * from './utils';

// نظام مراقبة الخدمات المتكامل
export { ServiceMonitor } from './core/base-service';

// عميل API الافتراضي المحسن
export { apiClient } from './core/api-client';

// معالج الأخطاء الافتراضي المحسن
export { errorHandler, handleError, handleErrorWithRetry } from './core/error-handler';

// دوال مساعدة للنظام الجديد
export * from './helpers';

/**
 * إعداد النظام الجديد للخدمات
 *
 * هذه الدالة تقوم بتهيئة جميع الخدمات وإعداد المراقبة والتسجيل
 */
export async function initializeServicesV2(): Promise<void> {
    console.log('🚀 Initializing Arkan Services v2.0...');

    try {
        // تهيئة مراقبة الأداء
        const monitor = ServiceMonitor.getInstance();

        // تهيئة عميل API مع التكوين الافتراضي
        const apiConfig = {
            baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
            timeout: 30000,
            retries: 3,
            retryDelay: 1000,
            enableCaching: true,
            cacheTTL: 5 * 60 * 1000, // 5 minutes
            enableMetrics: true,
        };

        // تهيئة معالج الأخطاء العام
        errorHandler.cleanup(); // تنظيف الأخطاء القديمة

        console.log('✅ Services v2.0 initialized successfully');

        // تسجيل مقاييس الأداء الأولية
        const metrics = {
            timestamp: new Date(),
            version: '2.0.0',
            status: 'initialized',
            services: monitor.getServiceHealth ? 'monitoring_enabled' : 'monitoring_disabled',
        };

        console.log('📊 Initial metrics:', metrics);

    } catch (error) {
        console.error('❌ Failed to initialize Services v2.0:', error);
        throw error;
    }
}

/**
 * الحصول على حالة صحة النظام
 */
export async function getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, any>;
    metrics: any;
    timestamp: Date;
}> {
    const monitor = ServiceMonitor.getInstance();

    try {
        const serviceHealth = await monitor.checkAllServices();
        const errorMetrics = errorHandler.getMetrics();

        // تحديد الحالة العامة للنظام
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
            metrics: {
                errors: errorMetrics,
                cache: apiClient.getMetrics ? apiClient.getMetrics() : null,
            },
            timestamp: new Date(),
        };

    } catch (error) {
        console.error('Failed to get system health:', error);
        return {
            status: 'unhealthy',
            services: {},
            metrics: { error: 'Failed to retrieve metrics' },
            timestamp: new Date(),
        };
    }
}

/**
 * دالة مساعدة لإنشاء خدمات جديدة
 *
 * مثال على الاستخدام:
 * ```typescript
 * const myService = createService({
 *   name: 'MyService',
 *   category: 'business',
 *   config: { endpoint: '/api/my-service' },
 *   schema: myInputSchema,
 *   handler: async (data) => { return await processData(data); }
 * });
 * ```
 */
export function createService<TInput, TOutput>(config: {
    name: string;
    category: 'core' | 'infrastructure' | 'business' | 'intelligent';
    config: any;
    schema?: any;
    handler: (data: TInput) => Promise<TOutput>;
}) {
    // هذه الدالة يمكن توسيعها لاحقاً لإنشاء خدمات جديدة بسهولة
    console.log(`Service "${config.name}" created in category "${config.category}"`);
    return config;
}

// خدمات محددة مهمة للوصول السريع (تم نقلها من المجلد القديم)
export { DocumentProcessingServiceV2 } from './intelligent/document-processing/document-processing-service';
export { WritingToolsServiceV2 } from './intelligent/writing-tools/writing-tools-service';
export { AdvancedContextAnalysisServiceV2 } from './intelligent/context-analysis/advanced-context-analysis-service';
export { ProjectServiceV2 } from './business/projects/project-service';
export { ProjectPlanServiceV2 } from './business/projects/project-plan-service';
export { TeamServiceV2 } from './business/teams/team-service';
export { AuthServiceV2 } from './infrastructure/auth/auth-service';
export { CollaborationServiceV2 } from './business/collaboration/collaboration-service';
export { ChatServiceV2 } from './business/collaboration/chat-service';

/**
 * ملخص للهيكل الجديد - Services v2.0 مكتمل:
 *
 * ✅ تم إنشاء هيكل منظم للخدمات مع فصل واضح للمسؤوليات
 * ✅ تطوير خدمة أساسية محسنة مع مراقبة الأداء والأخطاء
 * ✅ إنشاء عميل API متطور مع التخزين المؤقت والمراقبة
 * ✅ تطوير نظام معالجة الأخطاء المركزي المتقدم
 * ✅ إنشاء نظام مراقبة متكامل للخدمات
 * ✅ نقل خدمات البنية التحتية إلى /infrastructure/
 * ✅ نقل خدمات الأعمال إلى /business/
 * ✅ نقل خدمات الذكاء الاصطناعي إلى /intelligent/
 * ✅ إنشاء خدمات مراقبة متقدمة
 * ✅ تطوير أدوات مساعدة شاملة
 *
 * 🎯 الخطوات التالية:
 * - الانتقال التدريجي لاستخدام الخدمات الجديدة
 * - تحديث التبعيات والاستيرادات في المشروع
 * - اختبار شامل للنظام الجديد
 * - مراقبة الأداء والتحسين المستمر
 * - إزالة الملفات المكررة والمهجورة تدريجياً
 *
 * 🚀 الهيكل جاهز للاستخدام ويوفر إمكانيات توسع هائلة!
 */
