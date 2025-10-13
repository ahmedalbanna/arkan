/**
 * فهرس الأنواع المحسنة الأساسية - مشروع Arkan
 *
 * هذا الملف يحتوي على تصدير الأنواع الأساسية المحسنة لتحسين Type Safety
 * وتقليل استخدام `any` في جميع أنحاء المشروع
 */

// تصدير أنواع المحتوى المرن الأساسية
export type {
    ContentError, FlexibleContent, FlexibleContentHandler, ProposalData, SafeUpdateFunction, SectionData
} from './flexible-content-types';

// تصدير الدوال المساعدة لاستخدامها في الكود
export * from './ai-types';
export * from './api-types';
export * from './export-types';
export * from './flexible-content-types';
export {
    handleContentError, isFlexibleContent,
    isProposalData,
    isSectionData,
    toFlexibleContent,
    toProposalData,
    toSectionData
} from './flexible-content-types';
export * from './service-types';

/**
 * دوال مساعدة للتعامل مع الأنواع بشكل آمن
 */
export const TypeUtils = {
    /**
     * التحقق من أن القيمة من النوع المحدد
     */
    isOf: <T>(value: unknown, typeGuard: (value: unknown) => value is T): value is T => {
        return typeGuard(value);
    },

    /**
     * التحويل الآمن للأنواع
     */
    safeCast: <T>(value: unknown, defaultValue: T): T => {
        return (value as T) || defaultValue;
    },

    /**
     * إنشاء نوع من الكائن بـ نوع آمن
     */
    createTypedObject: <T extends Record<string, unknown>>(obj: T): T => obj,

    /**
     * التحقق من وجود خاصية في الكائن
     */
    hasProperty: <T extends Record<string, unknown>, K extends keyof T>(
        obj: T,
        key: K
    ): boolean => {
        return key in obj;
    },

    /**
     * الحصول على الخاصية بطريقة آمنة
     */
    safeGetProperty: <T extends Record<string, unknown>, K extends keyof T>(
        obj: T,
        key: K,
        defaultValue?: T[K]
    ): T[K] | undefined => {
        return obj[key] ?? defaultValue;
    }
};

/**
 * ثوابت للأخطاء الشائعة
 */
export const CommonErrors = {
    INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
    PARSING_ERROR: 'PARSING_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
} as const;

/**
 * أنواع للأخطاء الشائعة
 */
export type CommonErrorType = typeof CommonErrors[keyof typeof CommonErrors];

