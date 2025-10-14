/**
 * نظام API المبسط والموحد
 *
 * يحتوي على جميع الوظائف الأساسية المطلوبة لـ API
 * بدون التعقيدات غير الضرورية
 */

// النظام المبسط الجديد
export * from './simple-api';

// العميل الأساسي (للعمليات المعقدة)
export * from './client';

// النظام القديم (للتوافق مع الكود الموجود)
export {
    createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth
} from './enhanced-api-utils';

