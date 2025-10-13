/**
 * أنواع المحتوى المرن - لاستبدال استخدام `any` في العرض الديناميكي
 *
 * هذا الملف يحتوي على أنواع محسنة للتعامل مع المحتوى المرن الذي قد يأتي من API
 * أو من مصادر خارجية مختلفة، مع الحفاظ على Type Safety
 */

/**
 * المحتوى المرن الأساسي
 * يمكن أن يكون نصاً، رقماً، منطقياً، أو كائناً منسقاً
 */
export type FlexibleContent =
    | string
    | number
    | boolean
    | FlexibleContent[]
    | Record<string, FlexibleContent>;

/**
 * نوع Proposal محدد للاستخدام في المكونات
 */
export type ProposalData = {
    title?: string;
    description?: string;
    objectives?: string[];
    methodology?: string;
    deliverables?: string[];
    timeline?: string;
    budget?: string;
    sections?: Record<string, FlexibleContent>;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
};

/**
 * نوع Section محدد
 */
export type SectionData = {
    title?: string;
    content?: FlexibleContent;
    type?: 'text' | 'list' | 'object' | 'mixed';
    metadata?: Record<string, unknown>;
};

/**
 * نوع List تحديداً للقوائم
 */
export type ListContent =
    | string[]
    | SectionData[]
    | Record<string, FlexibleContent>[];

/**
 * نوع Object تحديداً للكائنات المنظمة
 */
export type ObjectContent = Record<string, FlexibleContent>;

/**
 * Helper types للتحقق من الأنواع
 */
export type IsFlexibleContent<T> = T extends FlexibleContent ? true : false;

export type IsProposalData<T> = T extends ProposalData ? true : false;

export type IsSectionData<T> = T extends SectionData ? true : false;

/**
 * Type Guards للتحقق من الأنواع في runtime
 */
export function isFlexibleContent(data: unknown): data is FlexibleContent {
    if (data === null || data === undefined) return false;

    if (typeof data === 'string' ||
        typeof data === 'number' ||
        typeof data === 'boolean') {
        return true;
    }

    if (Array.isArray(data)) {
        return data.every(item => isFlexibleContent(item));
    }

    if (typeof data === 'object') {
        return Object.values(data).every(value => isFlexibleContent(value));
    }

    return false;
}

export function isProposalData(data: unknown): data is ProposalData {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;
    return typeof obj === 'object';
}

export function isSectionData(data: unknown): data is SectionData {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;
    return typeof obj === 'object';
}

/**
 * دوال مساعدة للتحويل الآمن للأنواع
 */
export function toFlexibleContent(data: unknown): FlexibleContent | null {
    if (isFlexibleContent(data)) {
        return data;
    }
    return null;
}

export function toProposalData(data: unknown): ProposalData | null {
    if (isProposalData(data)) {
        return data;
    }
    return null;
}

export function toSectionData(data: unknown): SectionData | null {
    if (isSectionData(data)) {
        return data;
    }
    return null;
}

/**
 * نوع للتحديثات الآمنة
 */
export type SafeUpdateFunction = (
    key: string,
    value: FlexibleContent
) => void;

/**
 * نوع للدوال التي تقبل محتوى مرن
 */
export type FlexibleContentHandler<T extends FlexibleContent = FlexibleContent> = (
    content: T
) => void;

/**
 * أنواع للأخطاء في التعامل مع المحتوى المرن
 */
export type ContentError = {
    code: 'INVALID_CONTENT_TYPE' | 'PARSING_ERROR' | 'VALIDATION_ERROR';
    message: string;
    expectedType?: string;
    actualValue?: unknown;
};

/**
 * دالة للتعامل مع الأخطاء بشكل آمن
 */
export function handleContentError(
    error: unknown,
    fallback: FlexibleContent = ''
): FlexibleContent {
    console.warn('Content processing error:', error);
    return fallback;
}
