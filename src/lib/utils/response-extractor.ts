/**
 * مساعدات استخراج المحتوى من استجابات API
 * يبسط معالجة الاستجابات المعقدة ويقلل التكرار
 */

import type { SectionName } from '@/ai/schemas';

export interface ExtractedContent {
    content: string;
    metadata?: {
        sectionType?: string;
        wordCount?: number;
        quality?: string;
        citations?: string[];
        source?: string;
    };
}

/**
 * استخراج المحتوى من استجابة API مع معالجة شاملة للأخطاء
 * @param data استجابة API الخام
 * @param sectionKey مفتاح القسم المطلوب
 * @returns المحتوى المستخرج مع البيانات الوصفية
 */
export function extractContentFromResponse(data: any, sectionKey: SectionName): ExtractedContent {
    // حالة 1: البيانات هي نص مباشر
    if (typeof data === 'string') {
        return {
            content: data,
            metadata: {
                source: 'direct-string',
                wordCount: data.split(' ').length,
                quality: 'good'
            }
        };
    }

    // حالة 2: البيانات غير موجودة أو فارغة
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        throw new Error('Empty response from server');
    }

    // حالة 3: البيانات تحتوي على مفتاح القسم مباشرة
    if (data[sectionKey]) {
        const content = data[sectionKey];
        return {
            content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
            metadata: {
                sectionType: sectionKey,
                source: 'section-key',
                wordCount: typeof content === 'string' ? content.split(' ').length : 0,
                quality: 'good'
            }
        };
    }

    // حالة 4: البيانات تحتوي على خاصية content
    if (data.content) {
        return {
            content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2),
            metadata: {
                sectionType: data.sectionType || sectionKey,
                source: 'content-property',
                wordCount: typeof data.content === 'string' ? data.content.split(' ').length : 0,
                quality: data.quality || 'good',
                citations: data.citations || []
            }
        };
    }

    // حالة 5: البيانات تحتوي على خاصية data مع القسم
    if (data.data && data.data[sectionKey]) {
        const content = data.data[sectionKey];
        return {
            content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
            metadata: {
                sectionType: sectionKey,
                source: 'data-property',
                wordCount: typeof content === 'string' ? content.split(' ').length : 0,
                quality: 'good'
            }
        };
    }

    // حالة 6: البيانات تحتوي على أول مفتاح متاح
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
        const firstValue = data[firstKey];

        if (typeof firstValue === 'string') {
            return {
                content: firstValue,
                metadata: {
                    sectionType: firstKey,
                    source: 'first-key',
                    wordCount: firstValue.split(' ').length,
                    quality: 'good'
                }
            };
        }

        if (firstValue && typeof firstValue === 'object' && firstValue.content) {
            return {
                content: firstValue.content,
                metadata: {
                    sectionType: firstKey,
                    source: 'nested-content',
                    wordCount: firstValue.content.split(' ').length,
                    quality: firstValue.quality || 'good',
                    citations: firstValue.citations || []
                }
            };
        }
    }

    // حالة 7: محاولة تحليل JSON إذا كان المحتوى يبدو كـ JSON
    if (typeof data === 'object') {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            return {
                content: jsonString,
                metadata: {
                    sectionType: sectionKey,
                    source: 'json-fallback',
                    wordCount: jsonString.split(' ').length,
                    quality: 'parsed'
                }
            };
        } catch (error) {
            console.warn('Failed to stringify response data:', error);
        }
    }

    // حالة 8: فشل في استخراج المحتوى
    throw new Error(`Unable to extract content for section "${sectionKey}" from response`);
}

/**
 * التحقق من صحة استجابة API قبل المعالجة
 * @param data استجابة API
 * @param sectionKey مفتاح القسم المطلوب
 * @returns true إذا كانت الاستجابة صالحة
 */
export function validateApiResponse(data: any, sectionKey: SectionName): boolean {
    if (!data) return false;

    // التحقق من وجود المحتوى بأي شكل من الأشكال
    const hasContent =
        typeof data === 'string' ||
        data[sectionKey] ||
        data.content ||
        (data.data && data.data[sectionKey]) ||
        Object.keys(data).length > 0;

    return hasContent;
}

/**
 * إنشاء رسالة خطأ مفصلة لاستكشاف الأخطاء
 * @param error الخطأ الأصلي
 * @param sectionKey مفتاح القسم
 * @param responseData بيانات الاستجابة الخام
 * @returns رسالة خطأ مفصلة
 */
export function createDetailedErrorMessage(
    error: Error,
    sectionKey: SectionName,
    responseData?: any
): string {
    const baseMessage = `Failed to generate "${sectionKey}" section`;

    if (error.message.includes('Empty response')) {
        return `${baseMessage}: Server returned empty response. Please try again.`;
    }

    if (error.message.includes('Unable to extract content')) {
        return `${baseMessage}: Unexpected response format. Please contact support if this continues.`;
    }

    if (error.message.includes('Network error')) {
        return `${baseMessage}: Network connection issue. Please check your internet connection.`;
    }

    // إضافة معلومات إضافية للتطوير
    if (process.env.NODE_ENV === 'development' && responseData) {
        return `${baseMessage}: ${error.message}\n\nDebug info: ${JSON.stringify(responseData, null, 2)}`;
    }

    return `${baseMessage}: ${error.message}`;
}

/**
 * تنظيف المحتوى المستخرج وإزالة العناصر غير المرغوب فيها
 * @param content المحتوى الخام
 * @returns المحتوى المنظف
 */
export function cleanExtractedContent(content: string): string {
    if (!content || typeof content !== 'string') {
        return '';
    }

    // إزالة المسافات الزائدة
    let cleaned = content.trim();

    // إزالة الأحرف الخاصة غير المرغوب فيها
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // إزالة المسافات المتعددة
    cleaned = cleaned.replace(/\s+/g, ' ');

    // إزالة الأسطر الفارغة المتعددة
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    return cleaned;
}
