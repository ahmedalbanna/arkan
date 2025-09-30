/**
 * مثال على إعادة كتابة use-citation-generator-logic باستخدام Hook Factory
 * يوضح كيفية تبسيط إنشاء hooks جديدة
 */

import { z } from 'zod';
import { createWritingToolHook } from '../hooks/writing-tools/use-writing-tool-factory';

// مخطط التحقق من البيانات
const citationSchema = z.object({
    text: z.string().min(10, 'Please enter at least 10 characters.'),
    style: z.enum(['apa', 'mla', 'chicago']).optional(),
});

// القيم الافتراضية
const defaultValues = {
    text: '',
    style: 'apa' as const,
};

// إنشاء Hook باستخدام Factory
export const useCitationGeneratorLogic = createWritingToolHook({
    toolName: 'citation-generator',
    apiEndpoint: '/api/writing-tools/citation-generator',
    schema: citationSchema,
    defaultValues,
    successMessage: 'Citations generated successfully!',
    errorMessage: 'Failed to generate citations',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
});

/**
 * مقارنة بين الكود القديم والجديد:
 *
 * الكود القديم: 62 سطر
 * الكود الجديد: 20 سطر
 *
 * التحسينات:
 * 1. تقليل التكرار بنسبة 68%
 * 2. إزالة الكود المكرر لرفع الملفات والنسخ
 * 3. معالجة موحدة للأخطاء والإشعارات
 * 4. منطق أكثر وضوحاً وسهولة في القراءة
 * 5. قابلية أعلى للاختبار والصيانة
 * 6. سهولة إضافة ميزات جديدة
 */
