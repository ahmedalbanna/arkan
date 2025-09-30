/**
 * أدوات معالجة النصوص الموحدة
 *
 * هذا الملف يحتوي على جميع أدوات معالجة النصوص
 * المستخدمة في التطبيق
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج فئات CSS مع Tailwind
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * إنشاء كلمة مرور عشوائية
 */
export function generateRandomPassword(length: number = 12): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
}

/**
 * تنظيف النص من الأحرف الخاصة
 */
export function sanitizeText(text: string): string {
    return text
        .replace(/[<>]/g, '') // إزالة < >
        .replace(/javascript:/gi, '') // إزالة javascript:
        .replace(/on\w+=/gi, '') // إزالة event handlers
        .trim();
}

/**
 * تقصير النص مع إضافة نقاط
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * تحويل النص إلى عنوان URL
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // إزالة الأحرف الخاصة
        .replace(/[\s_-]+/g, '-') // استبدال المسافات والشرطات
        .replace(/^-+|-+$/g, ''); // إزالة الشرطات من البداية والنهاية
}

/**
 * تحويل النص إلى حالة العنوان
 */
export function toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

/**
 * تحويل النص إلى حالة الجملة
 */
export function toSentenceCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * إزالة المسافات الزائدة
 */
export function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * تحويل النص إلى camelCase
 */
export function toCamelCase(text: string): string {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, '');
}

/**
 * تحويل النص إلى PascalCase
 */
export function toPascalCase(text: string): string {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
        .replace(/\s+/g, '');
}

/**
 * تحويل النص إلى snake_case
 */
export function toSnakeCase(text: string): string {
    return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
}

/**
 * تحويل النص إلى kebab-case
 */
export function toKebabCase(text: string): string {
    return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * تحويل النص إلى UPPER_SNAKE_CASE
 */
export function toUpperSnakeCase(text: string): string {
    return toSnakeCase(text).toUpperCase();
}

/**
 * إزالة التشكيل من النص العربي
 */
export function removeArabicDiacritics(text: string): string {
    return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
}

/**
 * تحويل الأرقام العربية إلى إنجليزية
 */
export function convertArabicToEnglishNumbers(text: string): string {
    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
    const englishNumbers = '0123456789';

    return text.replace(/[٠-٩]/g, (char) =>
        englishNumbers[arabicNumbers.indexOf(char)]
    );
}

/**
 * تحويل الأرقام الإنجليزية إلى عربية
 */
export function convertEnglishToArabicNumbers(text: string): string {
    const englishNumbers = '0123456789';
    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';

    return text.replace(/[0-9]/g, (char) =>
        arabicNumbers[englishNumbers.indexOf(char)]
    );
}

/**
 * التحقق من أن النص يحتوي على أحرف عربية فقط
 */
export function isArabicText(text: string): boolean {
    return /^[\u0600-\u06FF\s]+$/.test(text);
}

/**
 * التحقق من أن النص يحتوي على أحرف إنجليزية فقط
 */
export function isEnglishText(text: string): boolean {
    return /^[a-zA-Z\s]+$/.test(text);
}

/**
 * التحقق من أن النص مختلط (عربي وإنجليزي)
 */
export function isMixedText(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text) && /[a-zA-Z]/.test(text);
}

/**
 * إزالة HTML tags من النص
 */
export function stripHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
}

/**
 * إزالة Markdown formatting من النص
 */
export function stripMarkdown(text: string): string {
    return text
        .replace(/#{1,6}\s+/g, '') // إزالة العناوين
        .replace(/\*\*(.*?)\*\*/g, '$1') // إزالة **bold**
        .replace(/\*(.*?)\*/g, '$1') // إزالة *italic*
        .replace(/`(.*?)`/g, '$1') // إزالة `code`
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // إزالة [links](url)
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // إزالة ![images](url)
        .replace(/^\s*[-*+]\s+/gm, '') // إزالة قوائم
        .replace(/^\s*\d+\.\s+/gm, '') // إزالة قوائم مرقمة
        .replace(/\n{3,}/g, '\n\n') // إزالة الأسطر الفارغة الزائدة
        .trim();
}

/**
 * تحويل النص إلى HTML آمن
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * تحويل HTML إلى نص عادي
 */
export function unescapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
    };

    return text.replace(/&(amp|lt|gt|quot|#39);/g, (match) => map[match]);
}

/**
 * حساب عدد الكلمات في النص
 */
export function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * حساب عدد الأحرف في النص
 */
export function countCharacters(text: string): number {
    return text.length;
}

/**
 * حساب عدد الأحرف بدون مسافات
 */
export function countCharactersNoSpaces(text: string): number {
    return text.replace(/\s/g, '').length;
}

/**
 * حساب عدد الأسطر في النص
 */
export function countLines(text: string): number {
    return text.split('\n').length;
}

/**
 * حساب وقت القراءة المقدر (بالدقائق)
 */
export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
    const wordCount = countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * إنشاء ملخص من النص
 */
export function createSummary(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;

    const words = text.split(' ');
    let summary = '';

    for (const word of words) {
        if ((summary + ' ' + word).length > maxLength) break;
        summary += (summary ? ' ' : '') + word;
    }

    return summary + '...';
}

/**
 * تحويل النص إلى قائمة من الكلمات
 */
export function textToWords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);
}

/**
 * إزالة الكلمات المكررة
 */
export function removeDuplicateWords(text: string): string {
    const words = textToWords(text);
    const uniqueWords = [...new Set(words)];
    return uniqueWords.join(' ');
}

/**
 * تحويل النص إلى قائمة من الجمل
 */
export function textToSentences(text: string): string[] {
    return text
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);
}

/**
 * تحويل النص إلى قائمة من الفقرات
 */
export function textToParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);
}

/**
 * مساعد للتحقق من أن النص فارغ
 */
export function isEmpty(text: string): boolean {
    return !text || text.trim().length === 0;
}

/**
 * مساعد للتحقق من أن النص ليس فارغاً
 */
export function isNotEmpty(text: string): boolean {
    return !isEmpty(text);
}

/**
 * مساعد للتحقق من أن النص يحتوي على رابط
 */
export function containsUrl(text: string): boolean {
    return /https?:\/\/[^\s]+/.test(text);
}

/**
 * مساعد للتحقق من أن النص يحتوي على بريد إلكتروني
 */
export function containsEmail(text: string): boolean {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text);
}

/**
 * مساعد للتحقق من أن النص يحتوي على رقم هاتف
 */
export function containsPhone(text: string): boolean {
    return /[\+]?[1-9][\d]{0,15}/.test(text);
}
